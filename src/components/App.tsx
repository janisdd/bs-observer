import * as React from "react";
import {observer} from "mobx-react"
import AddArea from "./addArea";
import ListOutputArea from "./output/listOutputArea";
import {AppState} from "../state/appState";
import FilterArea from "./filterArea";
import ExportArea from "./exportArea";
import {DialogHelper} from "../helpers/dialogHelper";
import ImportArea from "./importArea";
import Loader from "./helpers/loader";

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

        <nav className="navbar sticky-pos" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">

          </div>

          <div className="navbar-menu">
            <div className="navbar-start">
              <a className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : ''].join(' ')}
                 onClick={async () => {

                   if (this.props.appState.isLoaderDisplayed) {
                     return
                   }

                   await this.props.appState.captureBsStateFromOld(this.props.appState.series, true)
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

              <a
                className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : '', this.props.appState.isFilterAreaDisplayed ? 'is-my-active' : ''].join(' ')}
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

              <a
                className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : '', this.props.appState.isInputAreaDisplayed ? 'is-my-active' : ''].join(' ')}
                onClick={() => {

                  if (this.props.appState.isLoaderDisplayed) {
                    return
                  }

                  this.props.appState.setIsInputAreaDisplayed(!this.props.appState.isInputAreaDisplayed)
                }}>


                  <span className="icon has-text-info icon-margin">
                    <i className="fas fa-lg fa-plus"></i>
                </span>

                <span>Hinzufügen</span>
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
                <span>Zustand speichern</span>
              </a>

              <a
                className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : '', this.props.appState.isExportModalDisplayed? 'is-my-active' : ''].join(' ')}
                onClick={async () => {

                  if (this.props.appState.isLoaderDisplayed) {
                    return
                  }

                  this.props.appState.openExportModal()
                }}>
                <span className="icon has-text-info icon-margin">
                    <i className="fas fg-lg fa-upload"></i>
                </span>
                <span>
                  Export
                </span>
              </a>

              <a
                className={['navbar-item', this.props.appState.isLoaderDisplayed ? 'div-disabled' : '', this.props.appState.isImportModalDisplayed ? 'is-my-active' : ''].join(' ')}
                onClick={async () => {

                  if (this.props.appState.isLoaderDisplayed) {
                    return
                  }

                  this.props.appState.openImportModal()

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

                   const shouldDelete = await DialogHelper.askDialog('Zustand löschen', "Zustand wirklisch löschen? Dadurch werden alle gespeicherten Informationn & Serien gelöscht. Unter 'Import' kann der letzte Zustand wiederhergestellt werden.")

                   if (shouldDelete) {
                     this.props.appState.clearSavedState()
                   }

                 }}>
                <span className="icon has-text-danger icon-margin">
                    <i className="fas fg-lg fa-trash"></i>
                </span>
                <span>
                  Zustand löschen
                </span>
              </a>
            </div>
          </div>
        </nav>

        <div className="is-divider sticky-pos" style={{margin: '0', top: '52px'}}></div>

        {
          this.props.appState.isInputAreaDisplayed &&
          <AddArea appState={this.props.appState}/>
        }

        {//--- import modal
          this.props.appState.isImportModalDisplayed &&
          <div
            className={['modal', this.props.appState.isImportModalDisplayed ? 'is-active' : ''].join(' ')}>
            <div className="modal-background"
                 onClick={() => this.props.appState.closeImportModal()}></div>
            <div className="modal-content">
              <div className="box">
                <ImportArea appState={this.props.appState}/>
              </div>
            </div>
            <button className="modal-close is-large" aria-label="close"
                    onClick={() => this.props.appState.closeImportModal()}></button>
          </div>

        }


        {//--- export modal
          this.props.appState.isExportModalDisplayed &&
          <div
            className={['modal', this.props.appState.isExportModalDisplayed ? 'is-active' : ''].join(' ')}>
            <div className="modal-background"
                 onClick={() => this.props.appState.closeExportModal()}></div>
            <div className="modal-content">
              <div className="box">
                <ExportArea appState={this.props.appState}/>
              </div>
            </div>
            <button className="modal-close is-large" aria-label="close"
                    onClick={() => this.props.appState.closeExportModal()}></button>
          </div>
        }

        {
          this.props.appState.isFilterAreaDisplayed &&
          <FilterArea appState={this.props.appState}/>
        }

        {
          this.props.appState.isLoadingState &&
          <Loader/>
        }

        <ListOutputArea appState={this.props.appState}/>

      </div>
    )
  }
}

export default App