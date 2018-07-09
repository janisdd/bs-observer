import {action, runInAction, observable, computed} from "mobx"
import {Normalizer} from "../helpers/normalizer";
import {Capture} from "../helpers/capture";
import {SeriesComparer} from "../helpers/seriesComparer";
import {ExportAppState, FrontendManager} from "../helpers/frontendManager";

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

  @observable showOnlyChangedSeries = false

  @observable invertSeriesOrder = true

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


  //--- actions

  @action
  setSeriesListFromSeries() {

    if (this.series.length === 0) return

    this.seriesUrlsText = this.series.map(p => p.baseUrl).join('\n')
  }

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
      this.seriesUrlsText = state.seriesList
    } catch (err) {
      console.error(err)
      ReactNotifications.NotificationManager.error('Status konnten nicht importiert werden')
      return
    }
    ReactNotifications.NotificationManager.success('Status wurde importiert', '', 3000)
    this.isImportAreaDisplayed = false
    this.writeState()
  }

  @action
  setInvertSeriesOrder(showNewSeriesFirst: boolean) {
    this.invertSeriesOrder = showNewSeriesFirst
  }

  @action
  setShowOnlyChangedSeries(showOnlyChangedSeries: boolean) {
    this.showOnlyChangedSeries = showOnlyChangedSeries
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

    this.writeState()
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

        this.writeState()

      })
    }, 300)
  }

  @action
  async writeState() {

    try {

      const seriesUrls = this.seriesUrlsText.trim() === '' ? this.series.map(p => p.baseUrl).join('\n') : this.seriesUrlsText

      await FrontendManager.writeSeries(this.series, seriesUrls)
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

    let lastState: ExportAppState | null = null

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
      this.seriesUrlsText = (lastState as ExportAppState).seriesList
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

    this.writeState()

  }

  @action
  updateCaptureProgress(numCaptured: number): void {
    this.progressCount = numCaptured
  }


  @action
  setSelectSeason(series: Series, season: Season | null): void {

    if (season === null) {
      series.selectedSeasonId = null
      this.writeState()
      return
    }

    series.selectedSeasonId = season.seasonId
    this.writeState()
  }

  /**
   * compares the old and the current series and adds states to the current series
   */
  @action
  compareSeries() {
    SeriesComparer.compareSeries(this.oldSeries, this.series, [])
  }


  //--- getters


  /**
   * checks if we watched all ger/eng episodes
   * @param {Series} series
   * @param {boolean} eng
   * @param {boolean} excludeSpecials
   * @returns {boolean}
   */
  getWatchedAll(series: Series, eng: boolean, excludeSpecials = true): boolean {

    for (const season of series.seasons) {

      if (excludeSpecials && season.seasonId === '0') {
        continue
      }

      for (const episode of season.episodes) {

        if (eng && episode.watchedEng === false) {
          return false
        }

        if (!eng && episode.watchedGer === false) {
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