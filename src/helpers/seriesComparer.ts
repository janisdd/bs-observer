import {DialogHelper} from "./dialogHelper";

export class SeriesComparer {


  // /**
  //  * resets all states
  //  * @param {Series[]} series
  //  */
  // public static resetCompare(series: Series[]): void {
  //
  //   for (const singleSeries of series) {
  //     singleSeries.state = null
  //
  //     for (const season of singleSeries.seasons) {
  //       season.state = null
  //
  //       for (const episode of season.episodes) {
  //         episode.state = null
  //       }
  //     }
  //   }
  // }

  /**
   * calcs a diff between old series and the (new) series
   * @param {Series[]} oldSeries the old series
   * @param {Series[]} series the new series... we will preserve the state of the old series if found
   * @param {Series[]} removedSeries out param for the series that were removed from the (new) series compared to the old ones
   */
  public static compareSeries(oldSeries: Series[], series: Series[], removedSeries: Series[]): number {


    let numHasSomethingNew = 0

    let alreadyComparedSeriesUrls: string[] = []

    for (let i = 0; i < oldSeries.length; i++) {
      const oldSingleSeries = oldSeries[i]

      const newSingleSeries = series.find(p => p.baseUrl === oldSingleSeries.baseUrl)

      if (!newSingleSeries) {
        //old series was removed
        removedSeries.push(oldSingleSeries)
        continue
      }

      alreadyComparedSeriesUrls.push(oldSingleSeries.baseUrl)

      //preserve
      newSingleSeries.state = oldSingleSeries.state
      newSingleSeries.isMarked = oldSingleSeries.isMarked
      newSingleSeries.selectedSeasonId = oldSingleSeries.selectedSeasonId

      const res = this.compareSingleSeries(oldSingleSeries, newSingleSeries)

      if (res.hasSomethingNew) {
        numHasSomethingNew++
      }
    }

    //mark all new series
    for (const singleSeries of series) {

      if (alreadyComparedSeriesUrls.indexOf(singleSeries.baseUrl) !== -1) continue

      //this was not in the old series...
      singleSeries.state = 'new'
    }

    return numHasSomethingNew;

  }


  /**
   *
   * if at least one episode in a season is new we mark the season as new
   *
   *
   * we assume
   * seasons & episodes are only added, never removed
   * @param {Series} oldSeries
   * @param {Series} series
   */
  private static compareSingleSeries(oldSeries: Series, series: Series): {hasSomethingNew: boolean} {

    let hasSomethingNew = false

    //it is possible that a new season is inserted (e.g. specials) so 1 : 1 won't work here...

    for(let i = 0; i < series.seasons.length;i++) {
      const season = series.seasons[i]
      const oldSeason = oldSeries.seasons.find(p => p.seasonId.trim() === season.seasonId.trim())

      if (!oldSeason) {
        //season added
        hasSomethingNew = true
        season.state = 'new'

        for (const episode of season.episodes) {

          if (episode.name_ger !== null) {
            episode.state = "newAndGer"
          }
          else {
            episode.state = 'new'
          }
        }
      }

    }

    // //iterate new seasons
    // for (let i = oldSeries.seasons.length; i < series.seasons.length; i++) {
    //
    //   hasSomethingNew = true
    //
    //   // if (series.seasons[i].episodes.length > 0) {
    //   series.seasons[i].state = 'new'
    //   // }
    //
    //
    //   //set all episodes in the new season to new
    //   for (const episode of series.seasons[i].episodes) {
    //
    //     if (episode.name_ger !== null) {
    //       episode.state = "newAndGer"
    //     }
    //     else {
    //       episode.state = 'new'
    //     }
    //   }
    // }

    //then iterate episodes

    //it is possible that a new season is inserted (e.g. specials) so 1 : 1 won't work here...

    for (let i = 0; i < oldSeries.seasons.length; i++) {

      const oldSeason = oldSeries.seasons[i]
      const season = series.seasons.find(p => p.seasonId.trim() === oldSeason.seasonId.trim())

      if (!season) {
        throw new Error(`could not find new season with old name ${oldSeason.seasonId}`)
      }

      //preserve state
      season.state = oldSeason.state

      //iterate the new episodes
      for (let j = oldSeason.episodes.length; j < season.episodes.length; j++) {
        const episode = season.episodes[j]

        hasSomethingNew = true

        if (episode.name_ger !== null) {
          episode.state = "newAndGer"
        }
        else {
          episode.state = 'new'
        }

        //also mark the parent (season)
        season.state = "new"
      }



      //iterate old episodes
      for (let j = 0; j < oldSeason.episodes.length; j++) {
        const oldEpisode = oldSeason.episodes[j]
        const episode = season.episodes[j]

        //take always the old watching state
        episode.watchedEng = oldEpisode.watchedEng
        episode.watchedGer = oldEpisode.watchedGer

        //upadate: 02.12.2018
        //bs no longer have different names for the episodes... so check if the url changed

        // //check if we have a new lang
        // if (oldEpisode.name_ger === null && episode.name_ger !== null) {
        //   episode.state = 'gerAdded'
        //
        //   hasSomethingNew = true
        //
        //   //also mark the parent (season)
        //   season.state = "new"
        //   continue
        // }

        if (oldEpisode.name_en !== episode.name_en) {
          episode.state = 'gerAdded'
          hasSomethingNew = true
          season.state = 'new'
        }


        //preserve state
        episode.state = oldEpisode.state
      }

    }

    return {
      hasSomethingNew
    }

  }
}