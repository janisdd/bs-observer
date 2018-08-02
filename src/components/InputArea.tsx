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
    this.props.appState.setSeriesUrlsText(e.currentTarget.value)
  }

  render(): JSX.Element {
    return (
      <div className="input-area">


        <div style={{marginBottom: '1em'}}>
                <textarea id="input-list-area" className="textarea"
                          style={{width: '500px', height: '200px', marginBottom: '1em'}}
                          value={this.props.appState.addSeriesUrlsText}
                          onChange={(e) => this.updateInput(e)}
                ></textarea>

          <a className="button is-white"
             onClick={() => {

               if (this.props.appState.addSeriesUrlsText.trim() === '') return

               this.props.appState.getNewSeriesInitialState()

             }}
          >
            <span>Hinzufügen</span>

            <span className="icon has-text-info tooltip is-tooltip-multiline is-tooltip-right"
                  data-tooltip="Doppelte Einträge werden entfernt und nur neue Serien hinzugefügt">
                <i className="fas fa-info-circle"/>
              </span>
          </a>
        </div>


        <h3 className="title is-3">Vergleichen mit fremder Url-Liste</h3>
        <div>
          <textarea id="compare-list-area" className="textarea"
                    style={{width: '500px', height: '200px', marginBottom: '1em'}}
                    value={this.props.appState.compareSeriesUrlsText}
                    onChange={(e) => this.props.appState.setCompareSeriesUrlsText(e.currentTarget.value)}
          ></textarea>

          <a className="button is-white"
             onClick={() => {

               if (this.props.appState.compareSeriesUrlsText.trim() === '') return

               this.props.appState.compareBaseUrlLists()

             }}
          >
            <span>Vergleichen</span>
          </a>

          <div
            className={['modal', this.props.appState.isCompareSeriesBaseUrlsModalDisplayed ? 'is-active' : ''].join(' ')}>
            <div className="modal-background"
                 onClick={() => this.props.appState.closeCompareSeriesBaseUrlsModal()}></div>
            <div className="modal-content">
              <div className="box">

                <h3 className="title is-3">Neue Serien aus der fremden Liste</h3>

                <span
                  className="mar-right-half">{this.props.appState.missingComparedSeriesBaseUrls.length} Serie(n)</span>
                <span className="icon has-text-info icon-margin clickable tooltip is-tooltip-right"
                      data-tooltip="In Zwischenablage kopieren"
                      onClick={() => {

                        const copyText = document.getElementById("missing-list-area") as HTMLTextAreaElement;
                        copyText.select();
                        document.execCommand("copy");

                      }}>
            <i className="far fg-lg fa-clipboard"></i>
        </span>

                <textarea id="missing-list-area" className="textarea"
                          style={{height: '300px', marginBottom: '1em'}}
                          value={this.props.appState.missingComparedSeriesBaseUrls.join('\n')}
                          readOnly
                ></textarea>
              </div>
            </div>
            <button className="modal-close is-large" aria-label="close"
                    onClick={() => this.props.appState.closeCompareSeriesBaseUrlsModal()}></button>
          </div>

        </div>

      </div>
    )
  }
}

export default InputArea