// data
const getEloStats = require('../data/get-elo-stats')
const getElo = require('../data/get-elo')
const get = require('../data/get')

// constants
const { ELO_INITIAL } = require('../constants')

// action-creators
const update = require('./update')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')
const seedFromMovie = require('../tasks/seed-from-movie')

module.exports = function (movieId, callback) {
  return (dispatch, getState) => {
    const { seeding, username, command } = getState()
    console.log('seedCheck', movieId)
    let movie
    
    pull(
      once(seeding),
      filter((s) => !s),
      asyncMap((notSeeding, cb) => {
        get('movies', { id: movieId }, cb) 
      }),
      filter((movie) => !movie.seed),
//      asyncMap((notSeed, cb) => getEloStats(username, cb)),
//      filter(({eloCount}) => eloCount > 10),
      asyncMap((m, cb) => {
        movie = m
        getElo(username, movieId, (err, movieElo) => {
          if (movieElo > ELO_INITIAL) cb(null, true)
          else cb(null, false)
        })
      }),
      filter((shouldSeed) => shouldSeed),
      asyncMap((shouldSeed, cb) => {
        dispatch(update('seeding', true))
        command.log('seeding movies from ', movie.title)
        seedFromMovie(movieId, cb)
      }),
      drain((mId) => {
        dispatch(update('seeding', false))
        command.log('finished seeding')
        callback(null, mId)
      })
    )
  }
}
