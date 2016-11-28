// action-creators
const seedCheck = require('./seed-check')

// db
const getPair = require('../data/get-pair')
const getMovies = require('../data/get-movies')
const getRandomWatched = require('../data/get-random-watched')

// lib
const getLoserId = require('../lib/get-loser-id')
const eloMatch = require('../lib/elo-match')

// modules
const extend = require('xtend')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')

// questions
const { preferQuestion } = require('../questions')

module.exports = prefer

function prefer (options={}, callback) {
  return (dispatch, getState) => {
    const { movieAId, movieBId } = options
    const { command, username } = getState()
    options.username = options.username || username  

    pull(
      once(options),
      asyncMap((options, cb) => {
        if (!movieAId && !movieBId) {
          getRandomWatched(username, (err, movie) => {
            if (err) cb(err)
            cb(null, false)
            dispatch(prefer(
              extend(options, { movieAId: movie.id }), 
              callback
            ))
          })
        } else {
          cb(null, options)
        }
      }),
      filter((options) => options),
      asyncMap((options, cb) => {
        if (movieAId && !movieBId) {
          getPair(options, (err, movieBId) => {
            if (err) cb(err)
            cb(null, false)
            dispatch(prefer(extend(options, { movieBId }), callback))
          })
        } else if (movieAId && movieBId) {
          cb(null, options)
        }
      }),
      filter((options) => options),
      asyncMap((options, cb) => getMovies([movieAId, movieBId], cb)),
      asyncMap((movies, cb) => {
        command.prompt(preferQuestion(movies), (answer) => {
          cb(null, { movies, winnerId: answer.winner })
        })
      }),
      asyncMap((res, cb) => {
        const { movies, winnerId } = res
        
        eloMatch(
          username, 
          winnerId, 
          getLoserId(movies, winnerId), 
          cb
        )
      }),
      drain((winnerId) => {
        const next = require('./random-prompt')()
        dispatch(next())
        dispatch(seedCheck(winnerId, noop))
      })
    )
  }
}

function noop () { }
