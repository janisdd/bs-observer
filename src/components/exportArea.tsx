import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../state/appState";

interface Props {
  appState: AppState
}


@observer
class ExportArea extends React.Component<Props, any> {


  render(): JSX.Element {
    return (
      <div className="input-area">


        <h4 className="title is-4">Status</h4>

        <span className="icon has-text-info icon-margin clickable tooltip is-tooltip-right"
              data-tooltip="In Zwischenablage kopieren"
        onClick={() => {

          const copyText = document.getElementById("exportTextAreaState") as HTMLTextAreaElement;
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

        <textarea id="exportTextAreaState" className="textarea" style={{width: '500px', height: '200px', marginBottom: '1em'}}
                  value={this.props.appState.exportString} readOnly
        ></textarea>



        <h4 className="title is-4">Base-Url Liste</h4>

        <span className="icon has-text-info icon-margin clickable tooltip is-tooltip-right"
              data-tooltip="In Zwischenablage kopieren"
              onClick={() => {

                const copyText = document.getElementById("exportTextAreaSeriesList") as HTMLTextAreaElement;
                copyText.select();
                document.execCommand("copy");

              }}>
            <i className="far fg-lg fa-clipboard"></i>
        </span>
        <textarea id="exportTextAreaSeriesList" className="textarea" style={{width: '500px', height: '200px', marginBottom: '1em'}}
                  value={this.props.appState.exportSeriesList} readOnly
        ></textarea>


      </div>
    )
  }
}

export default ExportArea