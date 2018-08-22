import axios from 'axios'
import {AppState} from "../state/appState";

export class Capture {

  /**
   * catpures the state of the given series via the base urls
   * @param baseUrls
   * @param seriesToIgnore
   * @param onOneCaptureFinished
   * @param appState the app state too access
   *   @link AppState.isCancelCaptureStateRequested
   */
  public static async capture(baseUrls: string[], seriesToIgnore: Series[], onOneCaptureFinished: (numFinished: number) => void, appState: AppState): Promise<Series[]> {

    const now = new Date()
    const series: Series[] = []
    let captureCount = 0

    // const promises: Promise<Series>[] = []
    //
    for (const baseUrl of baseUrls) {
      // promises.push(this.getSeriesState(baseUrl))

      const ignoredSeries = seriesToIgnore.find(p => p.baseUrl === baseUrl)

      if (ignoredSeries) {
        series.push(ignoredSeries)
        console.log('ignored: ' + baseUrl)
        onOneCaptureFinished(captureCount)
        continue
      }

      try {
        const _series = await this.getSeriesState(baseUrl, now)
        series.push(_series)
        console.log('finished capture for: ' + baseUrl)
        captureCount++
        onOneCaptureFinished(captureCount)
      } catch (err) {
        throw err
      }

      if (appState.isCancelCaptureStateRequested) {
        const err = new Error('Vorgang wurde abgebrochen')
        // @ts-ignore
        err.isCancel = true
        throw err
      }

    }
    return series
  }


  /**
   * gets the series data from a base url
   * @param {string} baseUrl e.g. https://bs.to/serie/Sword-Art-Online
   * @param queryDate the date when this data was queried (use the same date for multiple queries if we check multiple, so pass as arg)
   * @returns {Promise<Series>}
   */
  public static async getSeriesState(baseUrl: string, queryDate: Date): Promise<Series> {

    let response = await axios.get<string>(baseUrl, {
      responseType: 'document'
    })

    if (response.status !== 200) {
      throw new Error(`could not get series info, status code: ${response.status}`)
    }

    //const parser = new DOMParser()
    let document = response.data as any as Document //parser.parseFromString(response.data, 'text/html')

    const imgNode = document.evaluate("//div[@id='sp_right']/img", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)

    let imgUrl: string | null = null

    if (imgNode) {
      imgUrl = (imgNode.singleNodeValue as HTMLImageElement).src
    }


    let titleNode = document.evaluate("//div[@id='sp_left']/h2/text()", document, null, XPathResult.STRING_TYPE, null)
    let title = titleNode.stringValue.trim()

    const result = document.evaluate("//div[@id='seasons']//li/a", document, null, XPathResult.ANY_TYPE, null)

    let node: Node | null = null

    let series: Series = {
      seasons: [],
      baseUrl,
      name: title !== '' ? title : baseUrl.substring(baseUrl.lastIndexOf('/') + 1),
      imgUrl,
      selectedSeasonId: null,
      state: null,
      lastQueriedAt: new Date(queryDate.valueOf()), //to not keep a reference
      isMarked: false,
      ignoreOnCompare: false
    }

    let seasonUrls: string[] = []

    while ((node = result.iterateNext()) !== null) {
      const el = node as HTMLAnchorElement
      series.seasons.push({
        episodes: [],
        //url: el.href, //e.g. https://bs.to/serie/Sword-Art-Online/1
        seasonId: el.href.substr(el.href.lastIndexOf('/') + 1),
        state: null
      })
      seasonUrls.push(el.href)
    }

    for (let i = 0; i < series.seasons.length; i++) {
      const season = series.seasons[i]
      const seasonUrl = seasonUrls[i]

      response = await axios.get<string>(seasonUrl, {
        responseType: 'document'
      })

      if (response.status !== 200) {
        throw new Error(`could not get series '${series.baseUrl}' season ${seasonUrl}, status code: ${response.status}`)
      }

      let document = response.data as any as Document//parser.parseFromString(response.data, 'text/html')

      //get the a's (urls) with the episode name
      const result = document.evaluate("//table[@class='episodes']//td[2]//a[not(@class) and count(./child::*) != 0]", document, null, XPathResult.ANY_TYPE, null)

      while ((node = result.iterateNext()) !== null) {
        const el = node as HTMLAnchorElement

        const nameEls = el.children


        let gerName: string | null = null
        let engName = ''

        if (nameEls.length === 1) {

          if (nameEls[0].tagName.toLowerCase() === 'strong') {
            gerName = (nameEls[0] as HTMLElement).innerText
            engName = ''
          }

          if (nameEls[0].tagName.toLowerCase() === 'span') {
            gerName = null
            engName = (nameEls[0] as HTMLElement).innerText
          }

        }
        else {
          engName = nameEls.length === 1 ? (nameEls[0] as HTMLElement).innerText : (nameEls[1] as HTMLElement).innerText
          gerName = nameEls.length === 1 ? null : (nameEls[0] as HTMLElement).innerText
        }

        season.episodes.push({
          //url: el.href,
          name_en: engName,
          name_ger: gerName,
          state: null,
          watchedGer: false,
          watchedEng: false
        })
      }
    }

    return series
  }
}