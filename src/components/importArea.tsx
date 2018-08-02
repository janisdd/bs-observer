import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../state/appState";
import {ChangeEvent} from "react";
import {DialogHelper} from "../helpers/dialogHelper";


interface Props {
  appState: AppState
}


@observer
class ImportArea extends React.Component<Props, any> {

  updateInput(e: ChangeEvent<HTMLTextAreaElement>) {
    this.props.appState.setImportString(e.currentTarget.value)
  }

  updateInput2(e: React.FocusEvent<HTMLTextAreaElement>) {
    this.props.appState.setImportString(e.currentTarget.value)
  }

  render(): JSX.Element {
    return (
      <div className="input-area">


        <div>
        <textarea className="textarea" style={{width: '500px', height: '200px', marginBottom: '1em'}}

                  onChange={(e) => this.updateInput(e)}
          // onBlur={(e) => this.updateInput2(e)}
        ></textarea>
          <span>
          ~{
            this.props.appState.importStringSizeString
          }
        </span>

          <br/>

          <a className="button is-white"
             onClick={() => {

               this.props.appState.importStatus()

             }}
          >
            Import Status
          </a>


          {
            this.props.appState.hasBackupState &&
            <a className="button is-white"
               onClick={async () => {

                 const shouldRollback = await DialogHelper.askDialog('Wiederherstellen', 'Soll wirklich der vorherige Zustand wiederhergestellt werden (vor dem letzten Speichern)?')

                 if (!shouldRollback) return

                 this.props.appState.rollbackState()

               }}
            >
          <span className="icon">
            <i className="fas fa-undo"></i>
          </span>
              <span>Vorherigen Status wiederverstellen</span>
            </a>
          }

        </div>



      </div>
    )
  }
}

export default ImportArea