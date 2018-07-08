import {action, runInAction, observable, computed} from "mobx"
import {Normalizer} from "../helpers/normalizer";
import {Capture} from "../helpers/capture";
import {SeriesComparer} from "../helpers/seriesComparer";
import {FrontendManager} from "../helpers/frontendManager";

const ReactNotifications = require('react-notifications/dist/react-notifications')


export class AppState {
  /**
   * not normalized
   * e.g. https://bs.to/serie/The-Asterisk-War/1
   * @type {any[]}
   */
  @observable seriesUrlsText: string =
    `https://bs.to/serie/Burst-Angel/1
https://bs.to/serie/Tokyo-Ghoul/3
`

  @observable isLoaderDisplayed: boolean = false

  @observable isInputAreaDisplayed = false

  @observable isFilterAreaDisplayed = false

  @observable searchText = ''

  @observable seriesBaseUrls: string[] = []

  @observable isExportAreaDisplayed = false
  @observable isImportAreaDisplayed = false

  @observable exportString = ''
  @observable exportStringSizeString = ''

  @observable importString = ''
  @observable importStringSizeString = ''

  /**
   * matches seriesBaseUrls length to indicate the progress
   * @type {number}
   */
  @observable progressCount = 0


  //--- computed

  @computed
  get captureProgress(): number {
    return this.progressCount * 100 / this.seriesBaseUrls.length
  }

  @computed
  get searchResults(): Series[] {

    let searchText = this.searchText.toLowerCase()

    return this.series.filter(series => {

      if (series.name.toLowerCase().indexOf(searchText) !== -1) {
        return true
      }

      for (const season of series.seasons) {

        for (const episode of season.episodes) {

          if (episode.name_en.toLowerCase().indexOf(searchText) !== -1) {
            return true
          }

          if (episode.name_ger !== null && episode.name_ger.toLowerCase().indexOf(searchText) !== -1) {
            return true
          }
        }
      }
    })
  }

  //--- actions

  @action
  setImportString(text: string) {
    this.importString = text
    const bytes = (new (TextEncoder as any)('utf-8').encode(text)).length
    this.importStringSizeString = FrontendManager.humanFileSize(bytes)
  }

  @action
  importStatus() {

    try {
      const state = FrontendManager.readStatusFromString(this.importString)

      if (!state) {
        ReactNotifications.NotificationManager.error('Status konnten nicht importiert werden, war ungültig')
        return
      }
      this.series = state.series
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Status konnten nicht importiert werden')
      return
    }
    ReactNotifications.NotificationManager.success('Status wurde importiert', '', 3000)
    this.isImportAreaDisplayed = false
    this.writeSeries()
  }

  @action
  setIsInputAreaDisplayed(isDisplayed: boolean) {
    this.isInputAreaDisplayed = isDisplayed
  }

  @action
  setIsFilterAreaDisplayed(isDisplayed: boolean) {
    this.isFilterAreaDisplayed = isDisplayed
  }

  @action
  setIsExportAreaDisplayed(isDisplayed: boolean) {
    this.isExportAreaDisplayed = isDisplayed
  }

  @action
  setIsImportAreaDisplayed(isDisplayed: boolean) {
    this.isImportAreaDisplayed = isDisplayed
  }

  @action
  async clearSavedState() {

    try {
      await FrontendManager.clearSeries()
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Status konnten gelöscht werden')
      return
    }

    ReactNotifications.NotificationManager.success('Status wurde gelöscht', '', 3000)

  }

  @action
  setSearchText(text: string) {
    this.searchText = text
  }

  @action
  updateSeriesUrlsText(text: string) {
    this.seriesUrlsText = text
    console.log(this.seriesUrlsText)
  }

  @action
  setIsLoaderDisplayed(isDisplayed: boolean) {
    this.isLoaderDisplayed = isDisplayed
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

    this.writeSeries()
  }


  @action
  async captureBsState() {

    this.parseSeriesUrls()

    this.updateCaptureProgress(0)
    this.isLoaderDisplayed = true

    let series: Series[] = []

    try {
      series = await Capture.capture(this.seriesBaseUrls, (numCaptured) => {

        runInAction(() => {
          this.updateCaptureProgress(numCaptured)
        })
      })
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Daten konnten nicht abgerufen werden')

      setTimeout(() => {
        runInAction(() => {
          this.isLoaderDisplayed = false
        })
      }, 1000)


      return
    }


    setTimeout(() => {
      runInAction(() => {
        this.oldSeries = this.series
        this.series = series

        this.compareSeries()

        this.writeSeries()

      })
    }, 300)
  }

  @action
  async writeSeries() {

    try {
      await FrontendManager.writeSeries(this.series)
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Status konnte nicht gespeichert werden')
      return
    }

    runInAction(() => {

      this.exportString = FrontendManager.lastStateString
      this.exportStringSizeString = FrontendManager.lastStateStringSizeString
      this.isLoaderDisplayed = false


      ReactNotifications.NotificationManager.success('Status gespeichert', '', 1500)

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

    let lastState: Series[] | null = []

    try {
      lastState = await FrontendManager.readSeries()
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Status konnten nicht geladen werden')
      return
    }

    if (lastState === null) {
      //no last state do nothing
      return
    }

    runInAction(() => {
      this.exportString = FrontendManager.lastStateString
      this.exportStringSizeString = FrontendManager.lastStateStringSizeString
      this.series = lastState as Series[]
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

    this.writeSeries()

  }

  @action
  updateCaptureProgress(numCaptured: number): void {
    this.progressCount = numCaptured
  }


  @action
  selectSeason(series: Series, season: Season | null): void {

    if (season === null) {
      series.selectedSeasonId = null
      return
    }

    series.selectedSeasonId = season.seasonId
  }

  /**
   * compares the old and the current series and adds states to the current series
   */
  @action
  compareSeries() {
    SeriesComparer.compareSeries(this.oldSeries, this.series, [])
  }


  //--- getters


  getSelectedSeason(series: Series): Season | null {

    if (series.selectedSeasonId === null) return null

    const season = series.seasons.find(p => p.seasonId === series.selectedSeasonId)

    if (!season) return null


    return season

  }

  //--- helpers

  parseSeriesUrls() {
    this.seriesBaseUrls = []
    const lines = this.seriesUrlsText.split('\n')

    for (const line of lines) {

      if (line === '') continue

      const baseUrl = Normalizer.normalizeBsUrl(line)
      if (baseUrl === null) {
        //TODO
        throw new Error()
      }

      this.seriesBaseUrls.push(baseUrl)
      console.log(baseUrl)
    }
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