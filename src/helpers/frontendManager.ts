import {appVersion} from "../constants";

export class FrontendManager {

  private static readonly stateKey = 'series'

  public static lastStateString = ''
  public static lastStateStringSizeString = ''


  public static clearSeries(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      localStorage.removeItem(this.stateKey)
      resolve()

    })

  }

  public static writeSeries(series: Series[], seriesList: string): Promise<void> {

    return new Promise<void>((resolve, reject) => {
      const copySeries: Series[] = series

      //this would save some memory but without network we won't get the episode names ...
      // const copySeries: Series[] = []
      //
      // for (let i = 0; i < series.length; i++) {
      //   const singleSeries = series[i]
      //
      //   const copySingleSeries = {...singleSeries}
      //
      //   copySingleSeries.seasons = []
      //
      //   for (let j = 0; j < singleSeries.seasons.length; j++) {
      //     const season = singleSeries.seasons[j]
      //     const copySeason = {...season}
      //     copySeason.episodes = []
      //     copySeason.url = ''
      //
      //     for (let k = 0; k < season.episodes.length; k++) {
      //       const episode = season.episodes[k]
      //
      //       const copyEpisode = {...episode}
      //       copyEpisode.name_en = ''
      //       copyEpisode.url = ''
      //
      //       copyEpisode.name_ger = copyEpisode.name_ger !== null ? '' : null;
      //
      //       copySeason.episodes.push(copyEpisode)
      //     }
      //
      //     copySingleSeries.seasons.push(copySeason)
      //   }
      //
      //   copySeries.push(copySingleSeries)
      // }


      const state: ExportAppState = {
        version: appVersion,
        series: copySeries,
        seriesList
      }

      const stateString = JSON.stringify(state)

      console.log(stateString)

      const lengthInBytes = (new (TextEncoder as any)('utf-8').encode(stateString)).length
      this.lastStateString = stateString
      this.lastStateStringSizeString = this.humanFileSize(lengthInBytes)

      console.log(`stat is ${lengthInBytes} bytes long --> ${this.lastStateStringSizeString}`)

      localStorage.setItem(this.stateKey, stateString)

      resolve()
    })
  }

  public static readSeries(): Promise<ExportAppState | null> {

    return new Promise<ExportAppState | null>((resolve, reject) => {

      const stateString = localStorage.getItem(this.stateKey)

      if (!stateString) {

        resolve(null)
        return
      }

      const state = this.readStatusFromString(stateString)

      if (!state) {
        resolve(null)
        return
      }


      resolve(state)
    })
  }

  public static readStatusFromString(stateString: string): ExportAppState | null {

    let state: ExportAppState | null = null

    try {
      state = JSON.parse(stateString)
    } catch (err) {
      throw err
    }

    if (!state) {
      return null
    }

    const lengthInBytes = (new (TextEncoder as any)('utf-8').encode(stateString)).length
    this.lastStateString = stateString
    this.lastStateStringSizeString = this.humanFileSize(lengthInBytes)

    return state

  }

  /**
   * from https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
   * @param {number} bytes
   * @param {boolean} si
   * @returns {string}
   */
  public static humanFileSize(bytes: number, si: boolean = true) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
    var units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  }
}


export interface ExportAppState {

  version: string
  series: Series[]
  seriesList: string

}