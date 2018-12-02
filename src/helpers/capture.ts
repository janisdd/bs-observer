import axios from 'axios'
import {AppState} from "../state/appState";

export interface SeriesCaptureXQueries {

  /**
   * if the name is not found we pretend the whole series was deleted
   * must return a single string/text node (e.g. use /text() )
   * XPathResult.STRING_TYPE
   */
  titleXQuery: XQueryCapture

  /**
   * must return a single node (an IMG node)
   * XPathResult.FIRST_ORDERED_NODE_TYPE
   */
  imgXQuery: XQueryCapture | null

  /**
   * must return a collection of urls (node.textContent so any inner text will be used)
   * XPathResult.ANY_TYPE
   */
  seasonsLinkXQuery: XQueryCapture | null

  /**
   * must return a collection of urls (node.textContent so any inner text will be used)
   * XPathResult.ANY_TYPE
   */
  seasonNameXQuery: XQueryCapture | null


  /**
   * must return a collection we use the (node.textContent so any inner text will be used)
   * XPathResult.ANY_TYPE
   */
  episodesXQuery: XQueryEpisode | null
}

export interface XQueryCapture {

  /**
   * the x query to execute
   */
  xQuery: string

  /**
   * an addition to the base url to execute the x query against (might be different than the original base url html site)
   */
  urlAddition: string
}

export interface XQueryEpisode {
  /**
   * the x query to execute to get the en name of the episode
   * NOT that for every en episode found an obj is inserted
   * for ger episodes we only fill from 0 to (found en episode)
   * SO we assume en episodes are always added first!
   */
  xQuery_en: string

  /**
   * the x query to execute to get the ger name of the episode
   */
  xQuery_ger: string | null

  /**
   * an addition to the base url to execute the x query against (might be different than the original base url html site)
   */
  urlAddition: string
}

interface SeasonWithUrl extends Season {
  url: string
}

export class Capture {

  /**
   * catpures the state of the given series via the base urls
   * @param baseUrls
   * @param seriesToIgnore
   * @param queryOptions
   * @param onOneCaptureFinished
   * @param appState the app state too access
   *   @link AppState.isCancelCaptureStateRequested
   */
  public static async capture(baseUrls: string[], seriesToIgnore: Series[],
                              onOneCaptureFinished: (numFinished: number) => void,
                              appState: AppState,
                              queryOptions: SeriesCaptureXQueries | null = null,
  ): Promise<Series[]> {

    const now = new Date()
    const series: Series[] = []
    let captureCount = 0


    const test: SeriesCaptureXQueries = {
      titleXQuery: {
        urlAddition: '',
        xQuery: `//div[@id='sp_left']/h2/text()`
      },
      imgXQuery: {
        urlAddition: '',
        xQuery: `//div[@id='sp_right']/img`
      },
      seasonsLinkXQuery: {
        urlAddition: ``,
        xQuery: `//div[@id='seasons']//li/a/@href`
      },
      seasonNameXQuery: {
        urlAddition: ``,
        xQuery: `//div[@id='seasons']//li/a`
      },
      episodesXQuery: {
        urlAddition: '',
        xQuery_en: `//table[@class='episodes']//td[2]//a[not(@class) and count(./child::*) != 0]`,
        xQuery_ger: null //`//table[@class='episodes']//td[2]//a[not(@class) and count(./child::*) != 0]`
      },
    }

    queryOptions = test

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
        const _series = await this.getSeriesState(baseUrl, now, queryOptions)

        if (_series) {
          series.push(_series)
          console.log('finished capture for: ' + baseUrl)
          console.log(_series)
        }
        else {
          console.warn('finished capture for: ' + baseUrl + ", series was deleted")
        }

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

  private static async getHtmlDocument(url: string): Promise<Document> {

    let response = await axios.get<string>(url, {
      responseType: 'document'
    })

    if (response.status !== 200) {
      throw new Error(`could not get document, status code: ${response.status}, url: ${url}`)
    }
    //const parser = new DOMParser()
    let doc = response.data as any as Document //parser.parseFromString(response.data, 'text/html')
    return doc
  }


  /**
   * returns the http base url with trailing /
   * @param baseUrl
   */
  private static getBaseUrlFromUrl(baseUrl: string): string {

    const parts = baseUrl.split('/')

    return parts[0] + '//' + parts[2] + '/'

  }

  public static async getSeriesState(baseUrl: string, queryDate: Date,
                                     queryOptions: SeriesCaptureXQueries
  ): Promise<Series | null> {

    let doc: Document

    //baseUrl is only the nromalized base url for the series
    const baseBaseUrl = this.getBaseUrlFromUrl(baseUrl)

    try {
      doc = await this.getHtmlDocument(baseUrl)
    } catch (err) {
      // console.error(err)
      throw err
    }

    let series: Series = {
      seasons: [],
      baseUrl,
      name: '',
      imgUrl: '',
      selectedSeasonId: null,
      state: null,
      lastQueriedAt: new Date(queryDate.valueOf()), //to not keep a reference
      isMarked: false,
      ignoreOnCompare: false
    }


    if (queryOptions.titleXQuery !== null) {

      let title: string | null
      try {
        title = await this.getTitle(!queryOptions.titleXQuery.urlAddition.trim()
                                    ? doc
                                    : null, baseUrl, queryOptions)
      } catch (err) {
        throw err
      }

      if (!title) return null

      series.name = title

    }


    if (queryOptions.imgXQuery !== null) {

      let imgUrl: string | null
      try {
        imgUrl = await this.getImageUrl(!queryOptions.imgXQuery.urlAddition.trim()
                                        ? doc
                                        : null, baseUrl, queryOptions)
      } catch (err) {
        throw err
      }

      if (imgUrl) {
        series.imgUrl = imgUrl
      }
    }


    let seasons: SeasonWithUrl[] | null = []

    if (queryOptions.seasonsLinkXQuery !== null) {

      try {
        seasons = await this.getEmptySeasons(!queryOptions.seasonsLinkXQuery.urlAddition.trim()
                                             ? doc
                                             : null, baseUrl, queryOptions)
      } catch (err) {
        throw err
      }

      if (seasons) {
        series.seasons = seasons
      }
    }

    if (queryOptions.episodesXQuery !== null && series.seasons.length > 0 && seasons) {

      for (const season of seasons) {

        const seasonUrl = season.url
                          ? `${baseBaseUrl}${season.url}`
                          : baseUrl //if the season.url is empty because all is on one site... use only base url
        delete season.url

        let episodes: Episode[] | null
        try {
          episodes = await this.getEpisodes(null, seasonUrl, queryOptions)
        } catch (err) {
          throw err
        }

        if (episodes) {
          season.episodes = episodes
        }
      }
    }

    return series
  }


  private static async getTitle(doc: Document | null, baseUrl: string,
                                queryOptions: SeriesCaptureXQueries
  ): Promise<string | null> {

    if (queryOptions.titleXQuery === null) return null

    if (doc === null) {
      try {
        doc = await this.getHtmlDocument(`${baseUrl}${queryOptions.titleXQuery.urlAddition}`)
      } catch (err) {
        throw err
      }
    }

    const titleNode = doc.evaluate(queryOptions.titleXQuery.xQuery, doc, null, XPathResult.STRING_TYPE, null)

    if (!titleNode) {
      throw new Error(`xquery didn't return a result`)
    }

    return titleNode.stringValue.trim()
  }

  private static async getImageUrl(doc: Document | null, baseUrl: string,
                                   queryOptions: SeriesCaptureXQueries
  ): Promise<string | null> {

    if (queryOptions.imgXQuery === null) return null

    if (doc === null) {
      try {
        doc = await this.getHtmlDocument(`${baseUrl}${queryOptions.imgXQuery.urlAddition}`)
      } catch (err) {
        throw err
      }
    }

    const imgNode = doc.evaluate(queryOptions.imgXQuery.xQuery, doc, null,
                                 XPathResult.FIRST_ORDERED_NODE_TYPE, null
    )

    if (!imgNode) {
      throw new Error(`xquery didn't return a result`)
    }

    if (!imgNode.singleNodeValue) {
      return null
    }


    return (imgNode.singleNodeValue as HTMLImageElement).src

  }


  private static async getEmptySeasons(doc: Document | null, baseUrl: string,
                                       queryOptions: SeriesCaptureXQueries
  ): Promise<SeasonWithUrl[] | null> {

    if (queryOptions.seasonsLinkXQuery === null) return null

    if (doc === null) {
      try {
        doc = await this.getHtmlDocument(`${baseUrl}${queryOptions.seasonsLinkXQuery.urlAddition}`)
      } catch (err) {
        throw err
      }
    }

    const seasonLinkNodes = doc.evaluate(queryOptions.seasonsLinkXQuery.xQuery, doc, null,
                                         XPathResult.ANY_TYPE, null
    )

    if (!seasonLinkNodes) {
      throw new Error(`xquery didn't return a result`)
    }

    const seasons: SeasonWithUrl[] = []

    let node: Node | null = null

    while ((node = seasonLinkNodes.iterateNext()) !== null) {
      seasons.push({
                     episodes: [],
                     url: node.textContent as string, //el.href, //e.g. https://bs.to/serie/Sword-Art-Online/1
                     seasonId: '', //el.href.substr(el.href.lastIndexOf('/') + 1),
                     state: null
                   })
    }

    if (queryOptions.seasonNameXQuery === null) {
      throw  new Error('seasonNameXQuery cannot be null if seasonsLinkXQuery was set')
    }

    const seasonNameNodes = doc.evaluate(queryOptions.seasonNameXQuery.xQuery, doc, null,
                                         XPathResult.ANY_TYPE, null
    )

    if (!seasonNameNodes) {
      throw new Error(`xquery didn't return a result`)
    }

    let count = 0
    while ((node = seasonNameNodes.iterateNext()) !== null) {
      const text = node.textContent as string
      seasons[count].seasonId = text.toLowerCase() === 'Specials'.toLowerCase()
                                ? '0'
                                : text
      count++
    }

    return seasons
  }

  private static async getEpisodes(doc: Document | null, baseUrl: string,
                                   queryOptions: SeriesCaptureXQueries
  ): Promise<Episode[] | null> {

    if (queryOptions.episodesXQuery === null) return null

    if (doc === null) {
      try {
        doc = await this.getHtmlDocument(`${baseUrl}${queryOptions.episodesXQuery.urlAddition}`)
      } catch (err) {
        throw err
      }
    }

    const episodesNodesEn = doc.evaluate(queryOptions.episodesXQuery.xQuery_en, doc, null, XPathResult.ANY_TYPE,
                                         null
    )

    if (!episodesNodesEn) {
      throw new Error(`xquery didn't return a result`)
    }

    const episodes: Episode[] = []

    let node: Node | null = null

    //we assume eng series are added always before ger ones
    while ((node = episodesNodesEn.iterateNext()) !== null) {

      let engName: string | null = node.textContent as string

      episodes.push(
        {
          //url: el.href,
          name_en: engName
                   ? engName.trim()
                   : '',
          name_ger: '',
          state: null,
          watchedGer: false,
          watchedEng: false
        }
      )
    }

    if (queryOptions.episodesXQuery.xQuery_ger !== null) {
      const episodesNodesGer = doc.evaluate(queryOptions.episodesXQuery.xQuery_ger, doc, null, XPathResult.ANY_TYPE,
                                            null
      )

      if (!episodesNodesGer) {
        throw new Error(`xquery didn't return a result`)
      }

      let count = 0
      while ((node = episodesNodesEn.iterateNext()) !== null) {
        let gerName: string | null = node.textContent as string
        episodes[count++].name_ger = gerName
                                     ? gerName.trim()
                                     : ''
      }

    }

    return episodes
  }


  /**
   * LEGACY ... was a proof of concept ... not very flexible/configurable
   * gets the series data from a base url
   * @param {string} baseUrl e.g. https://bs.to/serie/Sword-Art-Online
   * @param queryDate the date when this data was queried (use the same date for multiple queries if we check multiple, so pass as arg)
   * @returns {Promise<Series>}
   */
  public static async getSeriesState_legacy(baseUrl: string, queryDate: Date): Promise<Series> {

    let response = await axios.get<string>(baseUrl, {
      responseType: 'document'
    })

    if (response.status !== 200) {
      throw new Error(`could not get series info, status code: ${response.status}`)
    }

    //const parser = new DOMParser()
    let document = response.data as any as Document //parser.parseFromString(response.data, 'text/html')

    const imgNode = document.evaluate("//div[@id='sp_right']/img", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE,
                                      null
    )

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
      name: title !== ''
            ? title
            : baseUrl.substring(baseUrl.lastIndexOf('/') + 1),
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
      const result = document.evaluate("//table[@class='episodes']//td[2]//a[not(@class) and count(./child::*) != 0]",
                                       document, null, XPathResult.ANY_TYPE, null
      )

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
          engName = nameEls.length === 1
                    ? (nameEls[0] as HTMLElement).innerText
                    : (nameEls[1] as HTMLElement).innerText
          gerName = nameEls.length === 1
                    ? null
                    : (nameEls[0] as HTMLElement).innerText
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