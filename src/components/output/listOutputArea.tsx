import * as React from "react";
import {observer} from "mobx-react"
import ListOutputItem from "./listOutputItem";
import {AppState} from "../../state/appState";
import {FormatterHelper} from "../../helpers/formatterHelper";


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

    if (this.props.appState.showOnlyWatcherMissingGer) {
      series = series.filter(p => this.props.appState.getHasWatchedAll(p, false) === false)
    }

    if (this.props.appState.showOnlyWatcherMissingEng) {
      series = series.filter(p => this.props.appState.getHasWatchedAll(p, true) === false)
    }

    if (this.props.appState.showOnlyChangedSeries) {
      series = series.filter(p => this.props.appState.getHasSeriesSomethingNew(p))
    }

    if (this.props.appState.isFilterAreaDisplayed) {
      series = this.getSearchResults(series)
    }

    //then display marked first

    const markedSeries = series.filter(p => p.isMarked)
    const notMarkedSeries = series.filter(p => !p.isMarked)

    return (
      <div>

        <div className="flexed">

          <div>
            <div className="series-count">{this.props.appState.series.length} Serie(n) insgesamt</div>
            {
              series.length !== this.props.appState.series.length &&
              <div className="series-count">{series.length} Serie(n) nach Filter</div>
            }
          </div>

          {
            this.props.appState.lastSavedAt &&
            <div style={{flex: 1}}
              className="series-count">

              <span className="icon hoverable tooltip"
                    data-tooltip="Zuletzt gespeichert am"
              >
                <i className="fas fa-save"></i>
              </span>

              {FormatterHelper.getDateAsString(this.props.appState.lastSavedAt)} - {FormatterHelper.getTimeAsString(this.props.appState.lastSavedAt)}</div>
          }

        </div>

        <div>
          {
            this.props.appState.isLoaderDisplayed &&
            <div style={{padding: '3em', width: '100%'}}>
              <div className="loader-wrapper">
                <div id="preloader">
                  <div id="loader"/>
                </div>
              </div>
              <progress className="progress is-success"
                        value={this.props.appState.currentProgressVal * 100 / this.props.appState.maxProgressVal}
                        max="100"/>

              <div style={{textAlign: 'center'}}>
                {
                  this.props.appState.currentProgressVal
                }
                /
                {
                  this.props.appState.maxProgressVal
                }
              </div>

            </div>
          }


          {
            this.props.appState.isLoaderDisplayed === false && markedSeries.length > 0 &&
            <div>
              <h1 className="series-list-title">Markierte Serien</h1>
              <div className="series-list">
                {
                  markedSeries.map((value, index) => {
                    return (
                      <div className="list-element" key={value.baseUrl}>
                        <ListOutputItem state={this.props.appState} series={value}/>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          }

          {
            markedSeries.length > 0 && notMarkedSeries.length > 0 &&
            <div className="is-divider"></div>
          }

          {
            this.props.appState.isLoaderDisplayed === false && notMarkedSeries.length > 0 &&
            <div>
              <h1 className="series-list-title">Serien</h1>

              <div className="series-list">
                {
                  notMarkedSeries.map((value, index) => {
                    return (
                      <div className="list-element" key={value.baseUrl}>
                        <ListOutputItem state={this.props.appState} series={value}/>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          }

        </div>

      </div>
    )
  }
}

export default ListOutputArea