import * as React from "react";
import {observer} from "mobx-react"
import {AppState} from "../../state/appState";
import {ChangeEvent} from "react";
import {DialogHelper} from "../../helpers/dialogHelper";
import {FormatterHelper} from "../../helpers/formatterHelper";


interface Props {
  state: AppState
  series: Series
  seriesNumber: number
}


@observer
class ListOutputItem extends React.Component<Props, any> {
  render(): JSX.Element {

    const selectedSeason = this.props.state.getSelectedSeason(this.props.series)

    return (
      <div>

        <div className="box has-ribbon">

          <div className="top-left-box-button">
             <span className="icon  has-text-danger clickable tooltip is-tooltip-right series-marker"
                   data-tooltip="Löscht die Serie und alle verbundenen Daten"
                   onClick={async () => {

                     const shouldDelete = await DialogHelper.askDialog('Serie löschen', 'Solle die Serie und alle verbunden Daten wirklich gelöscht werden? Der Zustand wird nicht automatisch gespeichert.')


                     if (!shouldDelete) {
                       return
                     }

                     this.props.state.deleteSeries(this.props.series)
                   }}
             >
              <i className="fas fa-trash"></i>
            </span>
          </div>


          <div className="top-right-box-button">

            {
              this.props.series.ignoreOnCompare &&
              <span className="icon clickable tooltip ignore-series has-text-warning is-tooltip-multiline"
                    data-tooltip="[Ein] Ignoriert die Serie beim Prüfen und Vergleichen. Manuell Prüfen ist möglich"
                    onClick={() => {
                      this.props.state.setSeriesIgnoreOnCompare(this.props.series, false)
                    }}
              >
                <i className="fas fa-exclamation-circle"></i>
              </span>
            }

            {
              !this.props.series.ignoreOnCompare &&
              <span className="icon clickable tooltip ignore-series is-tooltip-multiline"
                    data-tooltip="[Aus] Ignoriert die Serie beim Prüfen und Vergleichen. Manuell Prüfen ist möglich"
                    style={{color: '#a5a5a5'}}
                    onClick={() => {
                      this.props.state.setSeriesIgnoreOnCompare(this.props.series, true)
                    }}
              >
                <i className="fas fa-exclamation-circle"></i>
              </span>
            }

            {
              this.props.series.isMarked &&
              <span className="icon  has-text-danger clickable tooltip series-marker"
                    data-tooltip="Markiert die Serie. Markiert serien werden vorn dargestellt"
                    onClick={() => {
                      this.props.state.setSeriesIsMarked(this.props.series, false)
                    }}
              >
              <i style={{marginTop: '-5px'}} className="fas fa-lg fa-bookmark"></i>
            </span>
            }

            {
              !this.props.series.isMarked &&
              <span className="icon  has-text-danger clickable tooltip series-marker"
                    data-tooltip="Markiert die Serie. Markiert serien werden vorn dargestellt"
                    onClick={() => {
                      this.props.state.setSeriesIsMarked(this.props.series, true)
                    }}
              >
              <i style={{marginTop: '-5px'}} className="far fa-lg fa-bookmark"></i>
            </span>
            }

            <a className={['button', 'is-white'].join(' ')}
               onClick={async () => {

                 const shouldReset = await DialogHelper.askDialog('', 'Wirklich Neuigkeiten zurücksetzen?')

                 if (!shouldReset) return

                 this.props.state.resetIsNewState(this.props.series)
               }}
            >
              <span>Reset News</span>

              <span className="icon has-text-info tooltip is-tooltip-multiline"
                    data-tooltip="Setzt alle Stati zurück und nichts wird mehr als neu angezeigt">
                <i className="fas fa-info-circle"/>
              </span>
            </a>
          </div>

          <article className="media">

            {
              //z index is needed because we set the content to 2
            }
            <div className="media-left sticky-pos" style={{top: '2em', zIndex: 3}}>

              {
                //check because legacy
                this.props.series.lastQueriedAt &&
                <div className="last-queried-at"
                     onClick={async () => {
                       await this.props.state.captureBsStateFromOld([this.props.series], false)
                     }}
                >
                  <span className="icon is-small icon-margin tooltip hoverable is-tooltip-right"
                        style={{fontSize: '0.8em'}}
                        data-tooltip="Zuletzt geprüft, clicken um manuall abzurufen">
                    <i className="fas fa-redo"></i>
                  </span>
                  <span
                    className="mar-right-half">{FormatterHelper.getDateAsString(this.props.series.lastQueriedAt)}</span>
                  <span>{FormatterHelper.getTimeAsString(this.props.series.lastQueriedAt)}</span>
                </div>
              }


              <div className="image">
                {
                  this.props.series.imgUrl !== null &&
                  <div className="box flat-box">
                    <img className="series-img" src={this.props.series.imgUrl} alt='not available'/>
                  </div>
                }
                {
                  this.props.series.imgUrl === null &&
                  <div className="box flat-box">
                    <img className="series-img has-shadow" alt='not available'/>
                  </div>
                }
              </div>

              {
                this.props.state.getHasWatchedAll(this.props.series, false) &&
                <div className="seen-all-ribbon">
                  <span className="icon icon-margin">
                    <i className="fas fa-glasses"></i>
                  </span>
                  <span>
                    Alle Deu gesehen
                  </span>
                </div>
              }

              {
                this.props.state.getHasWatchedAll(this.props.series, true) &&
                <div className="seen-all-ribbon eng">
                  <span className="icon icon-margin">
                    <i className="fas fa-glasses"></i>
                  </span>
                  <span>
                    Alle Eng gesehen
                  </span>
                </div>
              }


            </div>
            <div className="media-content" style={{marginTop: '1em'}}>
              <div className="content">

                <div className="sticky-pos series-title-and-seasons" style={{top: '3em'}}>
                  <a style={{fontSize: '1.5em', fontWeight: 'bold'}} href={this.props.series.baseUrl} target="_blank">
                    {
                      this.props.series.name
                    }
                  </a>
                  <div className="columns" style={{marginTop: '0'}}>
                    {
                      this.props.series.seasons.map((value, index) => {

                        const allWatchedGer =  value.episodes.every(p => p.watchedGer)
                        const allWatchedEng = value.episodes.every(p => p.watchedEng)
                        const isSelectedSeason = this.props.series.selectedSeasonId === value.seasonId

                        return (
                          <div key={index} className="column is-narrow">
                            <a
                              className={['button',

                                (allWatchedGer ||  allWatchedEng) && isSelectedSeason === false
                                  ? 'is-primary is-outlined'
                                  : (allWatchedGer ||  allWatchedEng) && isSelectedSeason === true
                                  ? 'is-primary'
                                  : 'is-light',
                                isSelectedSeason ? 'is-primary' : '',
                                value.state === 'new' ? 'badge' : ''
                              ].join(' ')}
                              data-badge={value.state === 'new' ? '' : null}
                              style={{marginRight: value.state === 'new' ? '1em' : '0'}}

                              onClick={() => {

                                if (selectedSeason !== null && value === selectedSeason) {
                                  this.props.state.setSelectSeason(this.props.series, null)
                                  return
                                }

                                this.props.state.setSelectSeason(this.props.series, value)
                              }}
                            >
                              {value.seasonId === '0' ? 'Specials' : value.seasonId}


                            </a>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>

                {
                  selectedSeason !== null &&
                  <div>
                    <table className="table is-striped is-hoverable is-narrow">
                      <thead>
                      <tr>
                        <th>#</th>
                        <th>Deu</th>
                        <th>
                          <span>Gesehen</span>
                          <span className="icon has-text-info icon-margin clickable tooltip"
                                data-tooltip="Setzte alle auf gesehen"
                                onClick={() => {
                                  this.props.state.setAllEpisodesToWatchedState(selectedSeason, false, true)
                                }}
                          >
                           <i className="fas fa-check-square"></i>
                         </span>
                          <span className="icon has-text-info icon-margin clickable tooltip"
                                data-tooltip="Setzte alle auf ungesehen"
                                onClick={() => {
                                  this.props.state.setAllEpisodesToWatchedState(selectedSeason, false, false)
                                }}
                          >
                            <i className="far fa-check-square"></i>
                          </span>
                        </th>
                        <th>Eng</th>
                        <th>
                          <span>Gesehen</span>
                          <span className="icon has-text-info icon-margin clickable tooltip"
                                data-tooltip="Setzte alle auf gesehen"
                                onClick={() => {
                                  this.props.state.setAllEpisodesToWatchedState(selectedSeason, true, true)
                                }}
                          >
                           <i className="fas fa-check-square"></i>
                         </span>
                          <span className="icon has-text-info icon-margin clickable tooltip"
                                data-tooltip="Setzte alle auf ungesehen"
                                onClick={() => {
                                  this.props.state.setAllEpisodesToWatchedState(selectedSeason, true, false)
                                }}
                          >
                            <i className="far fa-check-square"></i>
                          </span>
                        </th>
                      </tr>
                      </thead>

                      <tbody>
                      {
                        selectedSeason.episodes.map((episode, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                {
                                  (episode.name_ger !== null && episode.state === null) ?
                                    <strong>{episode.name_ger}</strong> : null
                                }

                                {
                                  (episode.name_ger !== null && (episode.state === "newAndGer" || episode.state === 'gerAdded')) &&
                                  <span className="badge is-badge-success is-badge-small" data-badge="">
                                    <strong>{episode.name_ger}</strong>
                                  </span>
                                }
                              </td>
                              <td>
                                <div className="field">
                                  <input className="is-checkradio" type="checkbox"
                                         id={'watched-ger-' + index + '-' + this.props.seriesNumber}
                                         checked={episode.watchedGer}
                                         onChange={(e) => {
                                           //console.log(arguments)
                                           const val = (e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value) as boolean
                                           this.props.state.setWatched(episode, false, val)
                                         }}
                                  />
                                  <label htmlFor={'watched-ger-' + index + '-' + this.props.seriesNumber}/>
                                </div>
                              </td>
                              <td>
                                {
                                  (episode.state === "new" || episode.state === "newAndGer") &&
                                  <span className="badge is-badge-success is-badge-small" data-badge="">
                                    {episode.name_en}
                                  </span>
                                }
                                {
                                  episode.state === null &&
                                  <span>
                                    {episode.name_en}
                                  </span>
                                }

                              </td>
                              <td>

                                <div className="field">
                                  <input className="is-checkradio" type="checkbox"
                                         id={'watched-eng-' + index + '-' + this.props.seriesNumber}
                                         checked={episode.watchedEng}
                                         onChange={(e) => {
                                           //console.log(arguments)
                                           const val = (e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value) as boolean
                                           this.props.state.setWatched(episode, true, val)
                                         }}
                                  />
                                  <label htmlFor={'watched-eng-' + index + '-' + this.props.seriesNumber}/>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      }
                      </tbody>

                    </table>
                  </div>
                }


              </div>
            </div>
          </article>
        </div>

      </div>
    )
  }
}

export default ListOutputItem

