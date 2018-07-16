import {SeriesComparer} from "../../src/helpers/seriesComparer";


const noSeasonSeries: () => Series = () => {
  return {
    baseUrl: '',
    state: null,
    selectedSeasonId: null,
    name: 'test',
    imgUrl: null,
    seasons: [],
    lastQueriedAt: new Date(),
    isMarked: false,
    ignoreOnCompare: false
  }
}

const oneEmptySeasonSeries: () => Series = () => {
  return {
    baseUrl: '',
    state: null,
    selectedSeasonId: null,
    name: 'test',
    imgUrl: null,
    seasons: [
      {
        seasonId: '0',
        episodes: [],
        state: null,
      }
    ],
    lastQueriedAt: new Date(),
    isMarked: false,
    ignoreOnCompare: false
  }
}

const oneEpisodeOneSeasonSeries: () => Series = () => {
  return {
    baseUrl: '',
    state: null,
    selectedSeasonId: null,
    name: 'test',
    imgUrl: null,
    seasons: [
      {
        seasonId: '0',
        episodes: [
          {
            watchedGer: false,
            watchedEng: false,
            state: null,
            name_ger: null,
            name_en: ''
          }
        ],
        state: null,
      }
    ],
    lastQueriedAt: new Date(),
    isMarked: false,
    ignoreOnCompare: false
  }
}

const oneEpisodeWithGerOneSeasonSeries: () => Series = () => {
  return {
    baseUrl: '',
    state: null,
    selectedSeasonId: null,
    name: 'test',
    imgUrl: null,
    seasons: [
      {
        seasonId: '0',
        episodes: [
          {
            watchedGer: false,
            watchedEng: false,
            state: null,
            name_ger: '',
            name_en: ''
          }
        ],
        state: null,
      }
    ],
    lastQueriedAt: new Date(),
    isMarked: false,
    ignoreOnCompare: false
  }
}

describe('comparer tests', () => {

  test('no series (comparer should not throw)', () => {

    const oldSeries: Series[] = []
    const newSeries: Series[] = []

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(removedSeries).toEqual([])
  })

  test('1 series removed', () => {

    const seriesCopy = oneEpisodeWithGerOneSeasonSeries()
    const oldSeries: Series[] = [
      seriesCopy
    ]
    const newSeries: Series[] = []

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(removedSeries.length).toEqual(1)
    expect(removedSeries[0]).toEqual(seriesCopy)
  })

  test('1 series added', () => {

    const oldSeries: Series[] = []
    const newSeries: Series[] = [
      noSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].state).toEqual('new')
    expect(removedSeries).toEqual([])
  })

  test('empty series --> season added (no episodes)', () => {

    const oldSeries: Series[] = [
      noSeasonSeries()
    ]
    const newSeries: Series[] = [
      oneEmptySeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].seasons[0].state).toEqual('new')
    expect(removedSeries).toEqual([])
  })

  test('empty series --> season added with episode', () => {

    const oldSeries: Series[] = [
      noSeasonSeries()
    ]
    const newSeries: Series[] = [
      oneEpisodeOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].seasons[0].state).toEqual('new')
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual('new')
    expect(removedSeries).toEqual([])
  })

  test('empty series --> season added with episode & ger', () => {

    const oldSeries: Series[] = [
      noSeasonSeries()
    ]
    const newSeries: Series[] = [
      oneEpisodeWithGerOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].seasons[0].state).toEqual('new')
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual('newAndGer')
    expect(removedSeries).toEqual([])
  })


  test('one episode, nothing changed', () => {

    const oldSeries: Series[] = [
      oneEpisodeOneSeasonSeries()
    ]
    const newSeries: Series[] = [
      oneEpisodeOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].seasons[0].state).toEqual(null)
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual(null)
    expect(removedSeries).toEqual([])
  })

  test('one episode, nothing changed had eng, ger', () => {

    const oldSeries: Series[] = [
      oneEpisodeWithGerOneSeasonSeries()
    ]
    const newSeries: Series[] = [
      oneEpisodeWithGerOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].seasons[0].state).toEqual(null)
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual(null)
    expect(removedSeries).toEqual([])
  })


  test('episode ger added', () => {

    const oldSeries: Series[] = [
      oneEpisodeOneSeasonSeries()
    ]
    const newSeries: Series[] = [
      oneEpisodeWithGerOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].seasons[0].state).toEqual('new')
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual('gerAdded')
    expect(removedSeries).toEqual([])
  })

  test('series state not changed by comparer', () => {
    const oldSeries: Series[] = [
      {
        ...noSeasonSeries(),
        state: 'new'
      }
    ]
    const newSeries: Series[] = [
      noSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].state).toEqual('new')
    expect(removedSeries).toEqual([])
  })

  test('series season state not changed by comparer', () => {

    const cp = oneEmptySeasonSeries()
    const oldSeries: Series[] = [
      {
        ...cp,
        seasons: cp.seasons.map(p => {
          return {
            ...p,
            state: 'new' as any
          }
        })

      }
    ]
    const newSeries: Series[] = [
      oneEmptySeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].state).toEqual(null)
    expect(newSeries[0].seasons[0].state).toEqual('new')
    expect(removedSeries).toEqual([])
  })

  test('series season episode state not changed by comparer', () => {
    const cp = oneEpisodeOneSeasonSeries()
    const oldSeries: Series[] = [
      {
        ...cp,
        seasons: cp.seasons.map(season => {
          return {
            ...season,
            state: null,
            episodes: season.episodes.map(p => {
              return {
                ...p,
                //this should not change the season state because the comparer should not change old states
                state: 'new' as any
              }
            })
          }
        })

      }
    ]
    const newSeries: Series[] = [
      oneEpisodeOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].state).toEqual(null)
    expect(newSeries[0].seasons[0].state).toEqual(null)
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual('new')
    expect(removedSeries).toEqual([])
  })

  test('series season episode state not changed by comparer (season was new)', () => {
    const cp = oneEpisodeOneSeasonSeries()
    const oldSeries: Series[] = [
      {
        ...cp,
        seasons: cp.seasons.map(season => {
          return {
            ...season,
            state: 'new' as any,
            episodes: season.episodes.map(p => {
              return {
                ...p,
                state: 'new' as any
              }
            })
          }
        })

      }
    ]
    const newSeries: Series[] = [
      oneEpisodeOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].state).toEqual(null)
    expect(newSeries[0].seasons[0].state).toEqual('new')
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual('new')
    expect(removedSeries).toEqual([])
  })

  test('series season episode new & ger added state not changed by comparer (season was new)', () => {
    const cp = oneEpisodeOneSeasonSeries()
    const oldSeries: Series[] = [
      {
        ...cp,
        seasons: cp.seasons.map(season => {
          return {
            ...season,
            state: 'new' as any,
            episodes: season.episodes.map(p => {
              return {
                ...p,
                state: 'newAndGer' as any
              }
            })
          }
        })

      }
    ]
    const newSeries: Series[] = [
      oneEpisodeOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].state).toEqual(null)
    expect(newSeries[0].seasons[0].state).toEqual('new')
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual('newAndGer')
    expect(removedSeries).toEqual([])
  })

  test('series season episode ger added state not changed by comparer (season was new)', () => {
    const cp = oneEpisodeOneSeasonSeries()
    const oldSeries: Series[] = [
      {
        ...cp,
        seasons: cp.seasons.map(season => {
          return {
            ...season,
            state: 'new' as any,
            episodes: season.episodes.map(p => {
              return {
                ...p,
                state: 'gerAdded' as any
              }
            })
          }
        })

      }
    ]
    const newSeries: Series[] = [
      oneEpisodeOneSeasonSeries()
    ]

    const removedSeries: Series[] = []
    SeriesComparer.compareSeries(oldSeries, newSeries, removedSeries, false)

    expect(newSeries[0].state).toEqual(null)
    expect(newSeries[0].seasons[0].state).toEqual('new')
    expect(newSeries[0].seasons[0].episodes[0].state).toEqual('gerAdded')
    expect(removedSeries).toEqual([])
  })

})
