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


  /**
   * used when we compare our list with an external list and then display what series we are missing
   */
  @observable missingComparedSeriesBaseUrls: string[] = []

  @observable isCompareSeriesBaseUrlsModalDisplayed = false

  @observable isExportModalDisplayed = false

  @observable compareSeriesUrlsText: string = ``

  @observable isLoaderDisplayed = false

  @observable isInputAreaDisplayed = false

  @observable isFilterAreaDisplayed = false

  /**
   * the scroll y
   */
  @observable scrollYObserved: number = 0

  @observable searchText = ''

  /**
   * the value of the progress bar
   */
  @observable currentProgressVal = 0
  @observable maxProgressVal = 0

  @observable isImportModalDisplayed = false

  /**
   * the state to export as string
   * @type {string}
   */
  @observable exportString = ''
  @observable exportStringSizeString = ''

  /**
   * the state to import as string
   */
  @observable importString = ''
  @observable importStringSizeString = ''

  @observable showOnlyChangedSeries = false

  @observable showOnlyWatcherMissingGer = false
  @observable showOnlyWatcherMissingEng = false

  @observable showOnlyIgnoredFilter = false

  @observable hasBackupState = false

  @observable lastSavedAt: Date | null = null


  /**
   * true: cancel the requests
   * false: not
   */
  @observable isCancelCaptureStateRequested = false


  //--- computed

  @computed
  get exportSeriesList(): string {
    return this.series.map(p => p.baseUrl).join('\n')
  }

  //--- actions

  @action
  setScrollYObserved(scrollY: number) {
    this.scrollYObserved = scrollY
  }

  @action
  setShowOnlyIgnoredFilter(showOnlyIgnored: boolean) {
    this.showOnlyIgnoredFilter = showOnlyIgnored
  }

  @action
  setsIsCancelCaptureStateRequested(isCancelCaptureStateRequested: boolean) {
    this.isCancelCaptureStateRequested = isCancelCaptureStateRequested
  }

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
    DialogHelper.show('Importiert', 'Zustand wurde importiert & gespeichert')
    this.isImportModalDisplayed = false

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
      this.isImportModalDisplayed = false
    }
  }

  @action
  setIsFilterAreaDisplayed(isDisplayed: boolean) {
    this.isFilterAreaDisplayed = isDisplayed

    if (isDisplayed === true) {
      this.isInputAreaDisplayed = false
      // this.isFilterAreaDisplayed = false
      this.isImportModalDisplayed = false
    }
  }


  @action
  setIsLoaderDisplayed(isDisplayed: boolean) {
    this.isLoaderDisplayed = isDisplayed

    if (isDisplayed) {
      //make sure all is collapsed
      this.setIsInputAreaDisplayed(false)
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
  collapseAllSeries() {
    for (const series of this.series) {
      series.selectedSeasonId = null
    }
  }

  @action
  setSearchText(text: string) {
    this.searchText = text
  }

  @action
  setSeriesUrlsText(text: string) {
    this.addSeriesUrlsText = text
  }

  @action
  setCompareSeriesUrlsText(text: string) {
    this.compareSeriesUrlsText = text
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
  closeCompareSeriesBaseUrlsModal() {
    this.isCompareSeriesBaseUrlsModalDisplayed = false
  }

  @action
  openExportModal() {
    this.isExportModalDisplayed = true
    this.refreshExportStateString()
  }

  @action
  closeExportModal() {
    this.isExportModalDisplayed = false
    this.exportString = ''
    this.exportStringSizeString = ''
  }

  @action
  openImportModal() {
    this.isImportModalDisplayed = true
  }

  @action
  closeImportModal() {
    this.isImportModalDisplayed = false
  }


  @action
  compareBaseUrlLists(): void {

    this.missingComparedSeriesBaseUrls = []

    const externalBaseUrls = this.parseSeriesUrls(this.compareSeriesUrlsText)
    const myBaseUrls = this.series.map(p => p.baseUrl)


    let missingBaseUrls: string[] = []

    for (const externalBaseUrl of externalBaseUrls) {

      if (myBaseUrls.indexOf(externalBaseUrl) === -1) {
        //we miss this series in our list...
        missingBaseUrls.push(externalBaseUrl)
      }
    }

    if (missingBaseUrls.length === 0) {

      DialogHelper.show('Keine Unterschiede', 'In der zu vergleichenden Liste wurden keine neuen Serien gefunden, die nicht schon in in dieser Liste enthalten sind')

      return
    }

    this.missingComparedSeriesBaseUrls = missingBaseUrls
    this.isCompareSeriesBaseUrlsModalDisplayed = true
  }

  @action
  async getNewSeriesInitialState(): Promise<void> {

    const seriesBaseUrls = this.parseSeriesUrls(this.addSeriesUrlsText)

    const oldSeriesBaseUrls = this.series.map(p => p.baseUrl)

    const newSeriesBaseUrls: string[] = []


    //filter all already known series out, take only new ones
    for (const url of seriesBaseUrls) {
      if (oldSeriesBaseUrls.indexOf(url) !== -1) continue
      if (newSeriesBaseUrls.indexOf(url) !== -1) continue
      newSeriesBaseUrls.push(url)
    }

    if (newSeriesBaseUrls.length === 0) {
      DialogHelper.show('', 'All hinzuzufügenden Serien sind bereits vorhanden')
      return
    }

    let alreadyKnownSeries = seriesBaseUrls.length - newSeriesBaseUrls.length

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
        }, this)

    } catch (err) {

      if (err.isCancel) {
        DialogHelper.error('', err.message)
      }
      else {
        console.error(err)
        const errorSeriesBaseUrl = newSeriesBaseUrls[seriesFinishedCount]
        DialogHelper.error('', `Daten konnten für '${errorSeriesBaseUrl}' nicht abgerufen werden`)
      }

      setTimeout(() => {
        runInAction(() => {
          this.setIsLoaderDisplayed(false)
          this.setSeriesUrlsText('')
          this.setsIsCancelCaptureStateRequested(false)
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
        this.setsIsCancelCaptureStateRequested(false)

        this.writeState()

        DialogHelper.show('', `${newSeriesBaseUrls.length} serien hinzugefügt, ${alreadyKnownSeries} bereits vorhanden oder doppelt.`)
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
  async captureBsStateFromOld(oldSeries: Series[], overwriteSeries: boolean): Promise<void> {


    let series: Series[] = []
    let seriesBaseUrls = oldSeries.map(p => p.baseUrl)
    let seriesFinishedCount = 0

    if (seriesBaseUrls.length === 0) {

      DialogHelper.show('', 'Nichts zu prüfen')

      return
    }

    let seriesToIgnore = overwriteSeries ? oldSeries.filter(p => p.ignoreOnCompare === true) : []

    this.maxProgressVal = seriesBaseUrls.length - seriesToIgnore.length
    this.currentProgressVal = 0
    this.setIsLoaderDisplayed(true)

    try {
      series = await Capture.capture(seriesBaseUrls,
        seriesToIgnore,
        (numFinished) => {
          seriesFinishedCount = numFinished
          runInAction(() => {
            this.currentProgressVal = numFinished
          })
        }, this)
    } catch (err) {

      if (err.isCancel) {
        DialogHelper.error('', err.message)
      }
      else {
        console.error(err)
        const errorSeriesBaseUrl = seriesBaseUrls[seriesFinishedCount - 1]
        DialogHelper.error('', `Daten konnten für '${errorSeriesBaseUrl}' nicht abgerufen werden`)
      }


      setTimeout(() => {
        runInAction(() => {
          this.setIsLoaderDisplayed(false)
          this.setsIsCancelCaptureStateRequested(false)
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
        this.setsIsCancelCaptureStateRequested(false)

      })
    }, 300)
  }


  @action
  async writeState() {

    const now = new Date()

    try {
      await FrontendManager.writeSeries(this.series, now)

    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Zustand konnte nicht gespeichert werden')
      return
    }

    runInAction(() => {

      this.hasBackupState = FrontendManager.hasBackupState()
      this.setIsLoaderDisplayed(false)
      this.lastSavedAt = now

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
      this.lastSavedAt = (lastState as ExportAppState).createdAt
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
      this.lastSavedAt = (lastState as ExportAppState).createdAt
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
   *
   * if some are not translated then we use watched (BUT we need at least one episode to be translated)
   * this is easier if we want to see if there are still seasons not translated
   * e.g. we watched some translated seasons but the last ones are not translated
   * @param {Series} series
   * @param {boolean} eng true: eng, false: ger
   * @param {boolean} excludeSpecials
   * @returns {boolean}
   */
  getHasWatchedAll(series: Series, eng: boolean, excludeSpecials = true): boolean {

    //return if we found a not watched episode


    for (const season of series.seasons) {

      if (excludeSpecials && season.seasonId === '0') {
        continue
      }

      if (eng) {
        //this should not happen because eng is always added before ger ??
        const allEmpty = season.episodes.every(p => p.name_en === '')
        //if nothing is there we cannot have watched it...
        if (allEmpty) {
          return true
        }

      }
      else {

        // atLeastOnGerWatched = season.episodes.some(p => p.watchedGer)
        //
        // const allEmpty = season.episodes.every(p => p.name_ger === null)
        // //if nothing is there we cannot have watched it...
        // if (allEmpty && atLeastOnGerWatched) {
        //   return true
        // }
      }


      for (const episode of season.episodes) {

        if (eng && episode.watchedEng === false) {
          return false
        }

        if (!eng && episode.watchedGer === false) {

          if (episode.name_ger === null) {
            //ger is not yet available so this is ok
            continue
          }

          return false
        }

      }
    }

    //if all seasons are untranslated then don't show that we watched all...

    if (series.seasons
      .filter(p => excludeSpecials && p.seasonId !== '0')
      .every(p => p.episodes.every(p => p.name_ger === null))) {
      return false
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


    for (let line of lines) {

      line = line.trim()

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