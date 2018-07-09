import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../state/appState";
import {ChangeEvent} from "react";
import _ = require("lodash");


interface Props {
  appState: AppState
}


@observer
class FilterArea extends React.Component<Props, any> {


  updateInput(e: ChangeEvent<HTMLInputElement>) {
    this.props.appState.setSearchText(e.currentTarget.value)
  }

  render(): JSX.Element {
    return (
      <div className="input-area">


        <div className="columns">
          <div className="column">
            <h1>Suchen</h1>

            <div className="field">
              {
                //is-loading
              }
              <p className="control has-icons-left">
                <input className="input" type="email" value={this.props.appState.searchText}
                       onChange={e => this.updateInput(e)}
                />
                <span className="icon is-small is-left">
                <i className="fas fa-search"></i>
              </span>
              </p>
            </div>

          </div>
          <div className="column">
            <h1>Filter</h1>

            <div className="field">
              <input className="is-checkradio" type="checkbox"
                     id={'show-only-new-cb'}
                     checked={this.props.appState.showOnlyChangedSeries}
                     onChange={(e) => {
                       //console.log(arguments)
                       const val = (e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value) as boolean
                       this.props.appState.setShowOnlyChangedSeries(val)
                     }}
              />
              <label htmlFor={'show-only-new-cb'}>Zeige nur geänderte</label>
            </div>

            <div className="field">
              <input className="is-checkradio" type="checkbox"
                     id={'show-new-series-first'}
                     checked={this.props.appState.invertSeriesOrder}
                     onChange={(e) => {
                       //console.log(arguments)
                       const val = (e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value) as boolean
                       this.props.appState.setInvertSeriesOrder(val)
                     }}
              />
              <label htmlFor={'show-new-series-first'}>
                <span>Kehre Reihenfolge der Serien um</span>
                <span className="icon has-text-info tooltip is-tooltip-multiline"
                      data-tooltip="Das ist praktisch, wenn man die Liste der serien Schritt für Schritt erweitert und neue Serien unten anfügt">
                <i className="fas fa-info-circle"/>
              </span>
              </label>
            </div>

          </div>
        </div>


      </div>
    )
  }
}

export default FilterArea