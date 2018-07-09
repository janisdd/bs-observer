import * as React from "react";
import {observer} from "mobx-react"
import InputArea from "./InputArea";
import ListOutputArea from "./output/listOutputArea";
import {AppState} from "../state/appState";
import FilterArea from "./filterArea";
import ExportArea from "./exportArea";
import {DialogHelper} from "../helpers/dialogHelper";
import ImportArea from "./importArea";

const ReactNotifications = require('react-notifications/dist/react-notifications')

interface Props {
  appState: AppState
}


@observer

class App extends React.Component<Props, any> {


  async componentWillMount() {
    await this.props.appState.loadLastState()
  }

  render(): JSX.Element {
    return (
      <div>

        <ReactNotifications.NotificationContainer/>

        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">

          </div>

          <div className="navbar-menu">
            <div className="navbar-start">
              <a className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : ''].join(' ')}
                 onClick={async () => {

                   if (this.props.appState.isLoaderDisplayed) {
                     return
                   }

                   await this.props.appState.captureBsState()
                 }}>
                <span className="icon has-text-info icon-margin">
                    <i className="fas fg-lg fa-play"></i>
                </span>
                <span>
                Prüfen & Vergleichen
                  </span>
              </a>

            </div>

            <div className="navbar-end">

              <a className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : ''].join(' ')}
                 onClick={() => {

                   if (this.props.appState.isLoaderDisplayed) {
                     return
                   }

                   this.props.appState.setIsFilterAreaDisplayed(!this.props.appState.isFilterAreaDisplayed)
                 }}>

                  <span className="icon has-text-info icon-margin">
                    <i className="fas fa-lg fa-search"></i>
                </span>

                <span>Filter & Suche</span>
              </a>

              <a className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : ''].join(' ')}
                 onClick={() => {

                   if (this.props.appState.isLoaderDisplayed) {
                     return
                   }

                   this.props.appState.setIsInputAreaDisplayed(!this.props.appState.isInputAreaDisplayed)
                 }}>
                {
                  this.props.appState.isInputAreaDisplayed &&
                  <span className="icon has-text-info icon-margin">
                  <i className="fas fa-book-open"></i>
                </span>
                }
                {
                  this.props.appState.isInputAreaDisplayed === false &&
                  <span className="icon has-text-info icon-margin">
                    <i className="fas fa-lg fa-book"></i>
                </span>
                }
                <span>Liste bearbeiten</span>
              </a>

              <a className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : ''].join(' ')}
                 onClick={async () => {

                   if (this.props.appState.isLoaderDisplayed) {
                     return
                   }

                   await this.props.appState.writeState()
                 }}>
                <span className="icon has-text-info">
                    <i className="fas fg-lg fa-save"></i>
                </span>
                <span>

                </span>
              </a>

              <a className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : ''].join(' ')}
                 onClick={async () => {

                   if (this.props.appState.isLoaderDisplayed) {
                     return
                   }

                   this.props.appState.setIsExportAreaDisplayed(!this.props.appState.isExportAreaDisplayed)
                 }}>
                <span className="icon has-text-info icon-margin">
                    <i className="fas fg-lg fa-upload"></i>
                </span>
                <span>
                  Export
                </span>
              </a>

              <a className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : ''].join(' ')}
                 onClick={async () => {

                   if (this.props.appState.isLoaderDisplayed) {
                     return
                   }

                   this.props.appState.setIsImportAreaDisplayed(!this.props.appState.isImportAreaDisplayed)
                 }}>
                <span className="icon has-text-info icon-margin">
                    <i className="fas fg-lg fa-download"></i>
                </span>
                <span>
                   Import
                </span>
              </a>

              <a className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : ''].join(' ')}
                 onClick={async () => {

                   if (this.props.appState.isLoaderDisplayed) {
                     return
                   }

                   const shouldDelete = await DialogHelper.askDialog('Status löschen', 'Status wirklisch löschen? Dadurch werden alle gespeicherten Informationn gelöscht')

                   if (shouldDelete) {
                     this.props.appState.clearSavedState()
                   }

                 }}>
                <span className="icon has-text-danger icon-margin">
                    <i className="fas fg-lg fa-trash"></i>
                </span>
                <span>
                  Status löschen
                </span>
              </a>
            </div>
          </div>
        </nav>

        <div className="is-divider" style={{margin: '0'}}></div>

        {
          this.props.appState.isInputAreaDisplayed &&
          <InputArea appState={this.props.appState}/>
        }

        {
          this.props.appState.isImportAreaDisplayed &&
          <ImportArea appState={this.props.appState}/>
        }

        {
          this.props.appState.isExportAreaDisplayed &&
          <ExportArea appState={this.props.appState}/>
        }

        {
          this.props.appState.isFilterAreaDisplayed &&
          <FilterArea appState={this.props.appState}/>
        }


        <ListOutputArea appState={this.props.appState}/>

      </div>
    )
  }
}

export default App