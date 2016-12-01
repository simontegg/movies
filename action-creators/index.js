// db
const insert = require('../data/insert')
const exists = require('../data/exists')
const get = require('../data/get')
const getMoviesJoined = require('../data/get-movies-joined')
const getRandomUnknown = require('../data/get-random-unknown')
const seen = require('../data/seen')

// modules
const extend = require('xtend')
// action-creators
const update = require('./update')
const ora = require('ora')
const seedCheck = require('./seed-check')
const spinners = require('cli-spinners')
const haveYouSeen = require('./have-you-seen')
const predict = require('./predict')
const prefer = require('./prefer')

// questions
const { confirmWatched } = require('../questions')
const { yourPredictions } = require('../messages')

// tasks
const favouriteMovie = require('../tasks/favourite-movie')
const seedFromMovie = require('../tasks/seed-from-movie')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const asyncMap = require('pull-stream/throughs/async-map')
const filterNot = require('pull-stream/throughs/filter-not')
const filter = require('pull-stream/throughs/filter')
const flatten = require('pull-stream/throughs/flatten')
const paramap = require('pull-paramap')
const map = require('pull-stream/throughs/map')
const collect = require('pull-stream/sinks/collect')
const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')

// modules
const shuffle = require('lodash.shuffle')
const reduce = require('lodash.reduce')
const includes = require('lodash.includes')
const pluck = require('lodash.pluck')
const _ = require('lodash')

module.exports = {
  login,
  haveYouSeen,
  learn,
  predictSequence
}

function predictSequence () {
  return (dispatch, getState) => {
    const { username, command, callback } = getState()
    let movieMap = {}

    const spinner = ora({ spinner: 'hamburger' }).start()

    pull(
      once(1),
      asyncMap((n, cb) => dispatch(predict(cb))),
      map((predictions) => {
        return predictions.map(({movieId, score}) => {
     //     movieMap = extend(movieMap, { [movieId]: { score } })
          return parseInt(movieId)
        })
      }),
      asyncMap((movieIds, cb) => getMoviesJoined(username, movieIds, cb)),
      flatten(),
      map((movie) => {
        movieMap[movie.id] = movie
        return movie
      }),
      filter((movie) => movie.watched == null),
      collect((err, unknownMovies) => {

        pull(
          once(unknownMovies),
          filter((unknownMovies) => unknownMovies.length > 0),
          asyncMap((unknownMovies, cb) => { 
            spinner.stop()
            dispatch(confirmSequence(unknownMovies, cb))
          }),
          flatten(),
          map(({watched, movieId}) => {
            if (watched) delete movieMap[movieId]
          }),
          onEnd(() => {
            spinner.stop()
            command.log(yourPredictions(_.map(movieMap))) 
            callback()
          })
        )
      })
    )
  }
}

function confirmSequence (unknownMovies, callback) {
  return (dispatch, getState) => {
    const { command, username } = getState()

    pull(
      once(unknownMovies),
      asyncMap((unknownMovies, cb) => {
        command.prompt(confirmWatched(unknownMovies), ({watched}) => {
          cb(
            null, 
            reduce(
              unknownMovies, 
              (memo, movie) => {
                memo.push({ 
                  username, 
                  movieId: movie.id,
                  watched: (includes(watched, movie.id))
                })
                return memo
              }, 
              []
            )
          )
        })
      }),
      flatten(),
      paramap(seen),
      collect(callback)
    )
  }
}

function learn () {
  return (dispatch, getState) => {
    const { username } = getState()

    pull(
      once(username),
      asyncMap(getRandomUnknown),
      asyncMap((movie, cb) => dispatch(haveYouSeen(movie, cb))),
        map(({ watched, movieId }) => {
        if (watched) dispatch(preferSequence({ movieAId: movieId }))
        return watched
      }),
      filterNot((watched) => watched),
      drain(() => dispatch(randomPrompt()))
    )
  }
}

function preferSequence (options={}) {
  return (dispatch) => {
    dispatch(prefer(options, (err, winnerId) => {
      if (err) console.log({err})
      dispatch(randomPrompt())
      dispatch(seedCheck(winnerId, noop))
    }))
  }
}

function randomPrompt () {
  return (dispatch) => {
    const next = shuffle([learn, preferSequence])[0]
    dispatch(next())
  }
}

function login (command, username, callback) {
  return [
    update('command', command),
    update('username', username),
    update('callback', callback),
    checkNewUser(username)
  ] 
}

function checkNewUser (username) {
  return (dispatch, getState) => {
    const { callback } = getState()

    exists('users', { username }, (err, userExists) => {
      if (err) return callback(err)
      if (userExists) {
        dispatch(update('message', `welcome ${username}`))
        callback()
      } else {
        dispatch(newUser(username))
      }
    })
  }
}

function newUser (username) {
  return (dispatch, getState) => {
    const { command, callback } = getState()
    pull(
      once(username),
      asyncMap((x, cb) => insert('users', { username }, cb)),
      asyncMap((x, cb) => favouriteMovie(command, username, cb)),
      asyncMap((movieId, cb) => {
        dispatch(update('seeding', true)) 
        command.log('seeding database with related movies')
        seedFromMovie(movieId, cb)
      }),
      onEnd(() => {
        dispatch(update('seeding', false))
        command.log('finished seeding')
        callback()
      })
    )
  }
}

function noop () {}

