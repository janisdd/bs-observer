import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../state/appState";
import {ChangeEvent} from "react";
import {DialogHelper} from "../helpers/dialogHelper";


interface Props {
  appState: AppState
}


@observer
class InputArea extends React.Component<Props, any> {


  componentDidMount() {
    //
    // let textarea = document.getElementById('input-list-area');
    //
    // if (!textarea) {
    //   throw new Error('TODO')
    // }
    // textarea.scrollTop = textarea.scrollHeight;

  }

  updateInput(e: ChangeEvent<HTMLTextAreaElement>) {
    this.props.appState.updateSeriesUrlsText(e.currentTarget.value)
  }

  render(): JSX.Element {
    return (
      <div className="input-area">


        <div>
                <textarea id="input-list-area" className="textarea"
                          style={{width: '500px', height: '200px', marginBottom: '1em'}}
                          value={this.props.appState.addSeriesUrlsText}
                          onChange={(e) => this.updateInput(e)}
                ></textarea>

          <a className="button is-white"
             onClick={() => {

               this.props.appState.getNewSeriesInitialState()

             }}
          >
            <span>Hinzufügen</span>
          </a>
        </div>


      </div>
    )
  }
}

export default InputArea