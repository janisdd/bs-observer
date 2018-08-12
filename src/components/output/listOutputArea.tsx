import * as React from "react";
import {observer} from "mobx-react"
import ListOutputItem from "./listOutputItem";
import {AppState} from "../../state/appState";
import {FormatterHelper} from "../../helpers/formatterHelper";
import ImportArea from "../importArea";


interface Props {
  appState: AppState
}


@observer
class ListOutputArea extends React.Component<Props, any> {


  observeScrollXHandle: number = 0

  componentDidMount() {

    this.observeScrollXHandle = setInterval(() => {
      this.props.appState.setScrollYObserved(window.scrollY)
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.observeScrollXHandle)
  }

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

    if (this.props.appState.showOnlyIgnoredFilter) {
      series = series.filter(p => p.ignoreOnCompare)
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

              <span style={{verticalAlign: 'top'}}>
              {FormatterHelper.getDateAsString(this.props.appState.lastSavedAt)} - {FormatterHelper.getTimeAsString(this.props.appState.lastSavedAt)}
              </span>
            </div>
          }

        </div>

        <div>
          {
            // this.props.appState.isLoaderDisplayed &&
            <div
              className={['modal', this.props.appState.isLoaderDisplayed ? 'is-active' : ''].join(' ')}>
              <div className="modal-background"></div>
              <div className="modal-content" style={{width: '90%'}}>
                <div className="box">

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

                    <div>
                      <a
                        className={['button', 'is-white', this.props.appState.isCancelCaptureStateRequested ? 'div-disabled' : ''].join(' ')}
                        onClick={() => {
                          this.props.appState.setsIsCancelCaptureStateRequested(true)
                        }}>Abbrechen</a>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          }


          {
            markedSeries.length > 0 &&
            <div>
              <h1 className="series-list-title">Markierte Serien</h1>
              <div className="series-list">
                {
                  markedSeries.map((value, index) => {
                    return (
                      <div className="list-element" key={value.baseUrl}>
                        <ListOutputItem state={this.props.appState} series={value} seriesNumber={index}/>
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
            notMarkedSeries.length > 0 &&
            <div>
              <h1 className="series-list-title">Serien</h1>

              <div className="series-list">
                {
                  notMarkedSeries.map((value, index) => {
                    return (
                      <div className="list-element" key={value.baseUrl}>
                        <ListOutputItem state={this.props.appState} series={value} seriesNumber={index}/>
                      </div>
                    )
                  })
                }
              </div>

              {
                this.props.appState.scrollYObserved > (window.innerHeight/2) &&
                <a className="button go-to-top-button is-medium" onClick={() => {
                  window.scrollTo({
                    behavior: "smooth",
                    top: 0,
                    left: 0
                  })
                }}>
                <span className="icon is-medium">
                <i className="fas fa-angle-up"></i>
                </span>
                </a>
              }


            </div>
          }

        </div>

      </div>
    )
  }
}

export default ListOutputArea