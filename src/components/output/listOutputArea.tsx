import * as React from "react";
import {observer} from "mobx-react"
import ListOutputItem from "./listOutputItem";
import {AppState} from "../../state/appState";


interface Props {
  appState: AppState
}


@observer
class ListOutputArea extends React.Component<Props, any> {

  getSearchResults(series: Series[]): Series[] {

    let searchText = this.props.appState.searchText.toLowerCase()

    return series.filter(singleSeries => {

      if (singleSeries.name.toLowerCase().indexOf(searchText) !== -1) {
        return true
      }

      for (const season of singleSeries.seasons) {

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

  render(): JSX.Element {

    let series = this.props.appState.series

    if (this.props.appState.invertSeriesOrder) {
      series = series.slice().reverse()
    }

    if (this.props.appState.showOnlyChangedSeries) {
      series = series.filter(p => this.props.appState.getHasSeriesSomethingNew(p))
    }

    if (this.props.appState.isFilterAreaDisplayed) {
      series = this.getSearchResults(series)
    }

    //then display marked first

    series = series.sort((a, b) => {
      if (a.isMarked && !b.isMarked) {
        return -1
      }
      else if (!a.isMarked && b.isMarked) {
        return 1
      }

      return 0
    })

    return (
      <div>

        <div className="series-list">
          {
            this.props.appState.isLoaderDisplayed &&
            <div style={{padding: '3em', width: '100%'}}>
              <div className="loader-wrapper">
                <div id="preloader">
                  <div id="loader"/>
                </div>
              </div>
              <progress className="progress is-success" value={this.props.appState.captureProgress} max="100"/>
            </div>
          }


          {
            this.props.appState.isLoaderDisplayed === false && this.props.appState.series.length > 0 &&
            series.map((value, index) => {
              return (
                <div className="list-element" key={value.baseUrl}>
                  <ListOutputItem state={this.props.appState} series={value}/>
                </div>
              )
            })

          }

        </div>

      </div>
    )
  }
}

export default ListOutputArea