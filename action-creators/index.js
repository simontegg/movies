// db
const insert = require('../data/insert')
const exists = require('../data/exists')
const get = require('../data/get')
const getMoviesJoined = require('../data/get-movies-joined')
const getRandomUnknown = require('../data/get-random-unknown')

// modules
const extend = require('xtend')
// action-creators
const update = require('./update')
const seedCheck = require('./seed-check')
const haveYouSeen = require('./have-you-seen')
const predict = require('./predict')
const prefer = require('./prefer')

// questions
const { confirmWatched } = require('../questions')

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

const shuffle = require('lodash.shuffle')

module.exports = {
  login,
  haveYouSeen,
  learn,
  recurseSeen,
  predictSequence
}

function predictSequence () {
  return (dispatch, getState) => {
    const { username, command } = getState()
    const notWatched = []
    let scoreMap = {}

    pull(
      once(1),
      asyncMap((n, cb) => dispatch(predict(cb))),
      map((predictions) => {
        return predictions.map((prediction) => {
          scoreMap = extend(
            scoreMap, 
            { [prediction.movieId]: prediction.score }
          )
          return parseInt(prediction.movieId)
        })
      }),
      asyncMap((movieIds, cb) => getMoviesJoined(username, movieIds, cb)),
      flatten(),
      map((movie) => {
        if (movie.watched != null) notWatched.push(movie)
        return movie
      }),
      filter((movie) => movie.watched == null),
      collect((err, unknownMovies) => {
        console.log({unknownMovies, scoreMap})
        if (unknownMovies.length > 0) {
          confirmSequence(command, unknownMovies, (err, updates) => {
            console.log({updates, scoreMap})


          })
        }

      })
    )
  }
}

function addToMap (scoreMap, predictions) {
  predictions.forEach((prediction) => {
    console.log(prediction)
    scoreMap = extend(scoreMap, { [prediction.movieId]: prediction.score })
  })

  return scoreMap
}

function confirmSequence (command, unknownMovies, callback) {
  pull(
    once(unknownMovies),
    asyncMap((unknownMovies, cb) => {
      command.prompt(confirmWatched(unknownMovies), (answer) => {
        cb(null, answer.watched)
      })
    }),
    flatten(),
    paramap((movieId, cb) => {
      seen({ username, movieId, watched: true }, cb)
    }),
    collect(callback)
  )
}

function recurseSeen (movieIds, index, callback) {
  return (dispatch) => {
    pull(
      once(movieIds[index]),
      asyncMap((id, cb) => get('movies', { id }, cb)),
        asyncMap((movie, cb) => dispatch(haveYouSeen(movie, cb))),
        map((update) => {
        const { watched } = update
        if (watched) dispatch(recurseSeen(movieIds, index++, callback))
          else return update
      }),
  filter((update) => update),
    drain((update) => {
    callback(null, update)
  })
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
    console.log('preferSequence', {options})
    dispatch(prefer(options, (err, winnerId) => {
      if (err) console.log({err})
      console.log({winnerId})
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
      if (err) callback(err)
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
        command.log('finished seeding', callback)
        callback()
      })
    )
  }
}

function noop () {}

