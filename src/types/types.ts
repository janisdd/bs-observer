interface Series {
  /**
   * the base e.g. https://bs.to/serie/The-Asterisk-War
   * without the season & episode
   */
  baseUrl: string

  /**
   * the name from the url e.g. The Asterisk War
   */
  name: string

  imgUrl: string | null

  seasons: Season[]

  selectedSeasonId: string | null

  /**
   * was added to list
   */
  state: null | 'new'

  // /**
  //  * true: preserve the states (e.g. new, ...) and merge new episodes, translations into this
  //  * false: overwrite the states without using the old states (on a diff)
  //  *
  //  * if something is new this will be automatically set to true
  //  * user then needs to set it manually to false (to indicate that it was noticed that something was new)
  //  */
  // preserveChanges: boolean
  /**
   * last date & time when we queried the series
   */
  lastQueriedAt: Date

  /**
   * true: the series is finished and we don't expect it to get changes
   * false: not
   */
  ignoreOnCompare: boolean

  /**
   * this is preserved across queries
   *
   * true: the series is marked and displayed top
   * false: not (default)
   */
  isMarked: boolean
}


interface Season {

  //not used, not needed
  // /**
  //  * e.g. https://bs.to/serie/The-Asterisk-War/1
  //  */
  // url: string

  /**
   * can be 0, 1, ...
   * 0 is the special season (ova, ...)
   */
  seasonId: string

  episodes: Episode[]

  /**
   * null = nothing  changed, new = was added
   */
  state: null | 'new'
}


interface Episode {
  //not used, not needed and see description for issue
  // /**
  //  * the url can change because the name of the episode is part of the url
  //  * if we have only en then the url is en
  //  * if we have german then the url contains the ger words
  //  */
  // url: string
  /**
   * for compression we might set this to ''
   */
  name_en: string
  /**
   * for compression we might set this to ''
   */
  name_ger: string | null

  /**
   * null = nothing changed
   * new = was added
   * gerAdded = german language was added
   * newAndGer = was added with german language
   */
  state: null | 'new' | 'gerAdded'  | 'newAndGer'

  watchedEng: boolean
  watchedGer: boolean

}
