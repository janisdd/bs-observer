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
            <h1>Filtern</h1>

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

          </div>
        </div>


      </div>
    )
  }
}

export default FilterArea