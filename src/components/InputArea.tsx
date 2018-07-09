import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../state/appState";
import {ChangeEvent} from "react";


interface Props {
  appState: AppState
}


@observer
class InputArea extends React.Component<Props, any> {


  updateInput(e: ChangeEvent<HTMLTextAreaElement>) {
    this.props.appState.updateSeriesUrlsText(e.currentTarget.value)
  }

  render(): JSX.Element {
    return (
      <div className="input-area">


        <div>
                <textarea className="textarea" style={{width: '500px', height: '200px', marginBottom: '1em'}}
                          value={this.props.appState.seriesUrlsText}
                          onChange={(e) => this.updateInput(e)}
                ></textarea>

          <a className="button is-primary"
             onClick={() => {

               this.props.appState.setSeriesListFromSeries()

             }}
          >
            <span className="icon is-small">
              <i className="fas fa-asterisk"></i>
            </span>
            <span>Erstelle Liste von Serien</span>
          </a>

          {/*<a className="button is-primary"*/}
             {/*onClick={async () => {*/}
               {/*await this.props.appState.captureBsState()*/}
             {/*}}*/}
          {/*>Prüfen & Vergleichen</a>*/}
        </div>


      </div>
    )
  }
}

export default InputArea