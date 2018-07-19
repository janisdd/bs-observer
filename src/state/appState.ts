import {action, runInAction, observable, computed} from "mobx"
import {Normalizer} from "../helpers/normalizer";
import {Capture} from "../helpers/capture";
import {SeriesComparer} from "../helpers/seriesComparer";
import {ExportAppState, FrontendManager} from "../helpers/frontendManager";
import {DialogHelper} from "../helpers/dialogHelper";

const ReactNotifications = require('react-notifications/dist/react-notifications')


export class AppState {
  /**
   * not normalized
   * e.g. https://bs.to/serie/The-Asterisk-War/1
   * this is only used to add new series
   */
  @observable addSeriesUrlsText: string =
    ``

  @observable isLoaderDisplayed = false

  @observable isInputAreaDisplayed = false

  @observable isFilterAreaDisplayed = false

  @observable searchText = ''

  @observable currentProgressVal = 0
  @observable maxProgressVal = 0

  @observable isExportAreaDisplayed = false
  @observable isImportAreaDisplayed = false

  @observable exportString = ''
  @observable exportStringSizeString = ''

  @observable importString = ''
  @observable importStringSizeString = ''

  @observable showOnlyChangedSeries = false

  @observable showOnlyWatcherMissingGer = false
  @observable showOnlyWatcherMissingEng = false

  @observable hasBackupState = false


  //--- computed

  @computed
  get exportSeriesList(): string {
    return this.series.map(p => p.baseUrl).join('\n')
  }

  //--- actions


  @action
  refreshExportStateString() {
    FrontendManager.setStateString(this.series)
    this.exportString = FrontendManager.lastStateString
    this.exportStringSizeString = FrontendManager.lastStateStringSizeString
  }

  @action
  setSeriesIgnoreOnCompare(series: Series, ignoreOnCompare: boolean) {
    series.ignoreOnCompare = ignoreOnCompare
  }

  @action
  deleteSeries(series: Series) {

    const index = this.series.indexOf(series)
    this.series.splice(index, 1)
  }

  @action
  setSeriesIsMarked(series: Series, isMarked: boolean) {
    series.isMarked = isMarked
  }

  @action
  setImportString(text: string) {
    this.importString = text
    // const bytes = (new (TextEncoder as any)('utf-8').encode(text)).length
    // this.importStringSizeString = FrontendManager.humanFileSize(bytes)
  }

  @action
  importStatus() {

    try {
      const state = FrontendManager.readStatusFromString(this.importString)

      if (!state) {
        DialogHelper.error('Fehler', 'Zustand konnten nicht importiert werden, war ungültig')
        return
      }
      this.series = state.series
    } catch (err) {
      console.error(err)
      DialogHelper.error('Fehler', 'Zustand konnten nicht importiert werden')
      return
    }
    DialogHelper.show('Importiert', 'Zustand wurde importiert')
    this.isImportAreaDisplayed = false

    //maybe we imported the wrong one and want to rollback...? --> let the user manually save
    this.writeState()
  }


  @action
  setShowOnlyChangedSeries(showOnlyChangedSeries: boolean) {
    this.showOnlyChangedSeries = showOnlyChangedSeries
  }

  @action
  setShowOnlyWatcherMissingGer(showOnlyWatcherMissingGer: boolean) {
    this.showOnlyWatcherMissingGer = showOnlyWatcherMissingGer
  }

  @action
  setShowOnlyWatcherMissingEng(showOnlyWatcherMissingEng: boolean) {
    this.showOnlyWatcherMissingEng = showOnlyWatcherMissingEng
  }


  @action
  setIsInputAreaDisplayed(isDisplayed: boolean) {
    this.isInputAreaDisplayed = isDisplayed

    if (isDisplayed === true) {
      // this.isInputAreaDisplayed = false
      this.isFilterAreaDisplayed = false
      this.isExportAreaDisplayed = false
      this.isImportAreaDisplayed = false
    }
  }

  @action
  setIsFilterAreaDisplayed(isDisplayed: boolean) {
    this.isFilterAreaDisplayed = isDisplayed

    if (isDisplayed === true) {
      this.isInputAreaDisplayed = false
      // this.isFilterAreaDisplayed = false
      this.isExportAreaDisplayed = false
      this.isImportAreaDisplayed = false
    }
  }

  @action
  setIsExportAreaDisplayed(isDisplayed: boolean) {
    this.isExportAreaDisplayed = isDisplayed

    if (isDisplayed === true) {
      this.isInputAreaDisplayed = false
      this.isFilterAreaDisplayed = false
      // this.isExportAreaDisplayed = false
      this.isImportAreaDisplayed = false

      this.refreshExportStateString()
    }
    else {
      this.exportString = ''
      this.exportStringSizeString = ''
    }
  }

  @action
  setIsImportAreaDisplayed(isDisplayed: boolean) {
    this.isImportAreaDisplayed = isDisplayed

    if (isDisplayed === true) {
      this.isInputAreaDisplayed = false
      this.isFilterAreaDisplayed = false
      this.isExportAreaDisplayed = false
      // this.isImportAreaDisplayed = false
    }
  }

  @action
  setIsLoaderDisplayed(isDisplayed: boolean) {
    this.isLoaderDisplayed = isDisplayed

    if (isDisplayed) {
      //make sure all is collapsed
      this.setIsInputAreaDisplayed(false)
      this.setIsImportAreaDisplayed(false)
      this.setIsExportAreaDisplayed(false)
      this.setIsFilterAreaDisplayed(false)

    }
  }

  @action
  async clearSavedState() {

    try {
      await FrontendManager.clearSeries()

      runInAction(() => {
        this.series = []
      })
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Zustand konnte nicht gelöscht werden')
      return
    }

    ReactNotifications.NotificationManager.success('Zustand wurde gelöscht', '', 3000)

  }

  @action
  setSearchText(text: string) {
    this.searchText = text
  }

  @action
  updateSeriesUrlsText(text: string) {
    this.addSeriesUrlsText = text
  }

  @action
  setAllEpisodesToWatchedState(season: Season, isEng: boolean, watched: boolean) {

    for (const episode of season.episodes) {
      if (isEng) {
        episode.watchedEng = watched
      }
      else {
        episode.watchedGer = watched
      }
    }

  }


  @action
  async getNewSeriesInitialState() {

    const seriesBaseUrls = this.parseSeriesUrls(this.addSeriesUrlsText)

    const oldSeriesBaseUrls = this.series.map(p => p.baseUrl)

    const newSeriesBaseUrls: string[] = []

    for (const url of seriesBaseUrls) {
      if (oldSeriesBaseUrls.indexOf(url) !== -1) continue
      newSeriesBaseUrls.push(url)
    }

    if (newSeriesBaseUrls.length === 0) {
      return
    }

    let series: Series[] = []
    let seriesFinishedCount = 0

    this.maxProgressVal = newSeriesBaseUrls.length
    this.currentProgressVal = 0
    this.setIsLoaderDisplayed(true)


    try {

      series = await
        Capture.capture(newSeriesBaseUrls, [], numFinished => {
          seriesFinishedCount = numFinished
          runInAction(() => {
            this.currentProgressVal = numFinished
          })
        })

    } catch (err) {
      console.error(err)
      const errorSeriesBaseUrl = newSeriesBaseUrls[seriesFinishedCount - 1]
      DialogHelper.error('', `Daten konnten für '${errorSeriesBaseUrl}' nicht abgerufen werden`)

      setTimeout(() => {
        runInAction(() => {
          this.setIsLoaderDisplayed(false)
          this.updateSeriesUrlsText('')
        })
      }, 500)


      return
    }

    setTimeout(() => {
      runInAction(() => {
        // this.series.push(...series)
        //add new at top
        let temp = this.series
        this.series = series

        for (const singleSeries of temp) {
          this.series.push(singleSeries)
        }

        this.setIsLoaderDisplayed(false)

        this.writeState()

        DialogHelper.show('', `${newSeriesBaseUrls.length} serien hinzugefügt`)
      })
    }, 500)


  }

  /**
   * checks all series we got for changes
   * @param {Series[]} oldSeries
   * @param {boolean} overwriteSeries true: the old series will replace the current series in the state (respect the ignore compare series),
   * false: only compare the given and replace the series states of the given series ignore the ignore compare series (in case you want to update only a couple series)
   * @returns {Promise<void>}
   */
  @action
  async captureBsStateFromOld(oldSeries: Series[], overwriteSeries: boolean) {


    let series: Series[] = []
    let seriesBaseUrls = oldSeries.map(p => p.baseUrl)
    let seriesFinishedCount = 0

    if (seriesBaseUrls.length === 0) {

      DialogHelper.show('', 'Nichts zu prüfen')

      return
    }

    this.maxProgressVal = seriesBaseUrls.length
    this.currentProgressVal = 0
    this.setIsLoaderDisplayed(true)

    let seriesToIgnore = overwriteSeries ? oldSeries.filter(p => p.ignoreOnCompare === true) : []

    try {
      series = await Capture.capture(seriesBaseUrls,
        seriesToIgnore,
        (numFinished) => {
          seriesFinishedCount = numFinished
          runInAction(() => {
            this.currentProgressVal = numFinished
          })
        })
    } catch (err) {
      console.error(err)
      const errorSeriesBaseUrl = seriesBaseUrls[seriesFinishedCount - 1]
      DialogHelper.error('', `Daten konnten für '${errorSeriesBaseUrl}' nicht abgerufen werden`)

      setTimeout(() => {
        runInAction(() => {
          this.setIsLoaderDisplayed(false)
        })
      }, 1000)

      return
    }


    setTimeout(() => {
      runInAction(() => {

        if (overwriteSeries) {

          this.oldSeries = this.series
          this.series = series

          //compares the old and the current series and adds states to the current series
          SeriesComparer.compareSeries(this.oldSeries, this.series, [])

          this.writeState()

        }
        else {

          oldSeries = this.series
          const capturedSeries = series

          //compares the old and the current series and adds states to the current series
          SeriesComparer.compareSeries(oldSeries, capturedSeries, [])


          //then replace the updates series
          for (const singleSeries of capturedSeries) {
            const oldSingleSeriesIndex = this.series.findIndex(p => p.baseUrl === singleSeries.baseUrl)

            if (oldSingleSeriesIndex === -1) {
              DialogHelper.error('', `Konnte Daten von '${singleSeries.baseUrl}' mit aktuellem Zustand nicht vereinigen`)
              return
            }

            this.series.splice(oldSingleSeriesIndex, 1, singleSeries)
          }
        }

        this.setIsLoaderDisplayed(false)

      })
    }, 300)
  }


  @action
  async writeState() {

    try {
      await FrontendManager.writeSeries(this.series)

    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Zustand konnte nicht gespeichert werden')
      return
    }

    runInAction(() => {

      this.hasBackupState = FrontendManager.hasBackupState()
      this.setIsLoaderDisplayed(false)

      ReactNotifications.NotificationManager.success('Zustand gespeichert', '', 1500)

    })
  }

  @action
  async rollbackState() {

    let lastState: ExportAppState | null = null

    try {
      lastState = await FrontendManager.readBackupState()
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Backup-Zustand konnte nicht geladen werden')
      return
    }

    if (lastState === null) {
      //no last state do nothing
      return
    }

    runInAction(() => {
      this.series = (lastState as ExportAppState).series
      console.log(`loaded backup state (${this.series.length})`)
    })
  }

  @action
  resetIsNewState(series: Series) {

    series.state = null
    for (const season of series.seasons) {
      season.state = null
      for (const episode of season.episodes) {
        episode.state = null
      }
    }
  }

  @action
  async loadLastState() {

    let lastState: ExportAppState | null = null

    try {
      lastState = await FrontendManager.readSeries()
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Zustand konnte nicht geladen werden')
      return
    }


    runInAction(() => {
      this.hasBackupState = FrontendManager.hasBackupState()

      if (lastState === null) {
        //no last state do nothing
        return
      }

      this.series = (lastState as ExportAppState).series
      console.log(`loaded old series (${this.series.length})`)
    })
  }

  @action
  setWatched(episode: Episode, isEng: boolean, watched: boolean) {

    if (isEng) {
      episode.watchedEng = watched
    }
    else {
      episode.watchedGer = watched
    }

  }


  @action
  setSelectSeason(series: Series, season: Season | null): void {

    if (season === null) {
      series.selectedSeasonId = null

      return
    }

    series.selectedSeasonId = season.seasonId
  }


  //--- getters


  /**
   * checks if we watched all ger/eng episodes
   * @param {Series} series
   * @param {boolean} eng
   * @param {boolean} excludeSpecials
   * @returns {boolean}
   */
  getHasWatchedAll(series: Series, eng: boolean, excludeSpecials = true): boolean {

    for (const season of series.seasons) {

      if (excludeSpecials && season.seasonId === '0') {
        continue
      }

      if (eng) {
        const allEmpty = season.episodes.every(p => p.name_en === '')
        //if nothing is there we cannot have watched it...
        if (allEmpty) {
          return false
        }

      }
      else {
        const allEmpty = season.episodes.every(p => p.name_ger === null)
        //if nothing is there we cannot have watched it...
        if (allEmpty) {
          return false
        }
      }


      for (const episode of season.episodes) {

        if (eng && episode.watchedEng === false) {
          return false
        }

        if (!eng && episode.watchedGer === false) {

          if (episode.name_ger === null) {
            //ger is not yet reads so this is ok
            continue
          }

          return false
        }

      }
    }

    return true
  }

  /**
   * if a season or an episode is in a new state
   */
  getHasSeriesSomethingNew(series: Series): boolean {

    // if (series.state === 'new') return true

    for (const season of series.seasons) {
      if (season.state === "new") return true

      for (const episode of season.episodes) {
        if (episode.state === "new" || episode.state === "newAndGer" || episode.state === "gerAdded") return true
      }
    }

    return false
  }

  getSelectedSeason(series: Series): Season | null {

    if (series.selectedSeasonId === null) return null

    const season = series.seasons.find(p => p.seasonId === series.selectedSeasonId)

    if (!season) return null


    return season

  }

  //--- helpers

  parseSeriesUrls(urls: string): string[] {
    let seriesBaseUrls = []
    const lines = urls.split('\n')


    for (const line of lines) {

      if (line === '') continue

      const baseUrl = Normalizer.normalizeBsUrl(line)
      if (baseUrl === null) {
        DialogHelper.error('', `Konnte Base-Url nicht erstellen von '${line}'`)
        throw new Error(`could not get base url from ${line}`)
      }

      seriesBaseUrls.push(baseUrl)
    }

    return seriesBaseUrls
  }

  /**
   * the old series we previously captured (used to compare)
   */
  @observable oldSeries: Series[] = []

  /**
   * the new series we captured
   */
  @observable series: Series[] = [] //JSON.parse('')
}


export const appState = new AppState()