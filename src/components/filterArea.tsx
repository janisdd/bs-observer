import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../state/appState";
import {ChangeEvent} from "react";


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
                <input className="input" type="text" value={this.props.appState.searchText}
                       onChange={e => this.updateInput(e)}
                />
                <span className="icon is-small is-left">
                <i className="fas fa-search"></i>
              </span>
              </p>
            </div>

            <div>
              <a className="button is-white" onClick={() => {
                this.props.appState.collapseAllSeries()
              }}>Alle zuklappen</a>
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
                     id={'show-only-not-watched-ger'}
                     checked={this.props.appState.showOnlyWatcherMissingGer}
                     onChange={(e) => {
                       const val = (e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value) as boolean
                       this.props.appState.setShowOnlyWatcherMissingGer(val)
                     }}
              />
              <label htmlFor={'show-only-not-watched-ger'}>Zeige noch nicht alle gesehen deu</label>
            </div>

            <div className="field">
              <input className="is-checkradio" type="checkbox"
                     id={'show-only-not-watched-eng'}
                     checked={this.props.appState.showOnlyWatcherMissingEng}
                     onChange={(e) => {
                       const val = (e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value) as boolean
                       this.props.appState.setShowOnlyWatcherMissingEng(val)
                     }}
              />
              <label htmlFor={'show-only-not-watched-eng'}>Zeige noch nicht alle gesehen eng</label>
            </div>

          </div>
        </div>


      </div>
    )
  }
}

export default FilterArea