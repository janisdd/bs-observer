import * as React from "react";
import {observer} from "mobx-react"
import ListOutputItem from "./listOutputItem";
import {AppState} from "../../state/appState";


interface Props {
  appState: AppState
}


@observer
class ListOutputArea extends React.Component<Props, any> {
  render(): JSX.Element {
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
            this.props.appState.isLoaderDisplayed === false && this.props.appState.series.length > 0 && this.props.appState.isFilterAreaDisplayed === false &&
            this.props.appState.series.map((value, index) => {
              return (
                <div className="list-element" key={value.baseUrl}>
                  <ListOutputItem state={this.props.appState} series={value}/>
                </div>
              )
            })
          }

          {
            this.props.appState.isLoaderDisplayed === false && this.props.appState.series.length > 0 && this.props.appState.isFilterAreaDisplayed &&
            this.props.appState.searchResults.map((value, index) => {
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