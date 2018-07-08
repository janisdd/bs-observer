import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../state/appState";
import {ChangeEvent} from "react";
import _ = require("lodash");


interface Props {
  appState: AppState
}


@observer
class ImportArea extends React.Component<Props, any> {

  updateInput(e: ChangeEvent<HTMLTextAreaElement>) {
    this.props.appState.setImportString(e.currentTarget.value)
  }

  render(): JSX.Element {
    return (
      <div className="input-area">


        <textarea className="textarea" style={{width: '500px', height: '200px', marginBottom: '1em'}}
                  value={this.props.appState.importString}
                  onChange={(e) => this.updateInput(e)}
        ></textarea>
        <span>
          ~{
          this.props.appState.importStringSizeString
        }
        </span>

        <br />

        <a className="button is-primary"
           onClick={() => {

             this.props.appState.importStatus()

           }}
        >
          Import Status
        </a>

      </div>
    )
  }
}

export default ImportArea