import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../state/appState";
import {ChangeEvent} from "react";
import _ = require("lodash");


interface Props {
  appState: AppState
}


@observer
class ExportArea extends React.Component<Props, any> {


  render(): JSX.Element {
    return (
      <div className="input-area">


        <span className="icon has-text-info icon-margin clickable"
        onClick={() => {

          const copyText = document.getElementById("exportTextArea") as HTMLTextAreaElement;
          copyText.select();
          document.execCommand("copy");

        }}>
            <i className="far fg-lg fa-clipboard"></i>
        </span>

        <span>
          ~{
            this.props.appState.exportStringSizeString
          }
        </span>

        <textarea id="exportTextArea" className="textarea" style={{width: '500px', height: '200px', marginBottom: '1em'}}
                  value={this.props.appState.exportString} readOnly
        ></textarea>


      </div>
    )
  }
}

export default ExportArea