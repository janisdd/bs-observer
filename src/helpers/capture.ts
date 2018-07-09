import axios from 'axios'

export class Capture {
  public static async capture(baseUrls: string[], onOneCaptureFinished: (numFinished: number) => void): Promise<Series[]> {

    console.log('Start')

    const now = new Date()
    const series: Series[] = []

    // const promises: Promise<Series>[] = []
    //
    for (const baseUrl of baseUrls) {
      // promises.push(this.getSeriesState(baseUrl))

      try {
        const _series = await this.getSeriesState(baseUrl, now)
        series.push(_series)
        onOneCaptureFinished(series.length)
      } catch (err) {
        throw err
      }
    }
    return series
  }


  /**
   *
   * @param {string} baseUrl e.g. https://bs.to/serie/Sword-Art-Online
   * @param queryDate
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
      isMarked: false
    }

    while ((node = result.iterateNext()) !== null) {
      const el = node as HTMLAnchorElement
      series.seasons.push({
        episodes: [],
        url: el.href, //e.g. https://bs.to/serie/Sword-Art-Online/1
        seasonId: el.href.substr(el.href.lastIndexOf('/') + 1),
        state: null
      })
    }

    for (const season of series.seasons) {

      response = await axios.get<string>(season.url, {
        responseType: 'document'
      })

      if (response.status !== 200) {
        throw new Error(`could not get series '${series.baseUrl}' season ${season.url}, status code: ${response.status}`)
      }

      let document = response.data as any as Document//parser.parseFromString(response.data, 'text/html')

      //get the a's (urls) with the episode name
      const result = document.evaluate("//table[@class='episodes']//a[not(@class) and count(./child::*) != 0]", document, null, XPathResult.ANY_TYPE, null)

      while ((node = result.iterateNext()) !== null) {
        const el = node as HTMLAnchorElement

        const nameEls = el.children

        season.episodes.push({
          url: el.href,
          name_en: nameEls.length === 1 ? (nameEls[0] as HTMLElement).innerText : (nameEls[1] as HTMLElement).innerText,
          name_ger: nameEls.length === 1 ? null : (nameEls[0] as HTMLElement).innerText,
          state: null,
          watchedGer: false,
          watchedEng: false
        })
      }
    }

    return series
  }
}