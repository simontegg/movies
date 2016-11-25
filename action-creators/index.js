// db
const insert = require('../data/insert')
const exists = require('../data/exists')
const getPair = require('../data/get-pair')

// tasks
const favouriteMovie = require('../tasks/favourite-movie')
const seedFromMovie = require('../tasks/seed-from-movie')

// lib
const getRandomUnwatched = require('../lib/get-random-unwatched')
const eloMatch = require('../lib/elo-match')

// questions
const { seenMovie, preferQuestion } = require('../questions')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const onEnd = require('pull-stream/sinks/on-end')
const drain = require('pull-stream/sinks/drain')
const many = require('pull-many')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')

// constants
const { UPDATE } = require('../constants')

module.exports = {
  login,
  haveYouSeen
}

function haveYouSeen (callback) {
  return (dispatch, getState) => {
    const { command, username } = getState() 

    pull(
      once(username),
      asyncMap(getRandomUnwatched),
      asyncMap((movie, cb) => {
        command.prompt(seenMovie(movie), (answer) => {
          cb(null, { response: answer.response, movieId: movie.id })
        })
      }),
      map((res) => {
        const { response, movieId } = res

        if (response === 'yes') {
          return movieId
        } else {
          dispatch(haveYouSeen(command, username, callback))
          return false
        }
      }),
      filter((movieId) => movieId),
      drain((movieId) => dispatch(prefer({ username, movieId }, callback)))
    )
  }
}

function prefer ({username, movieId}, callback) {
  return (dispatch) => {
    const options = { username, movieAId: movieId }

    pull(
      once(options),
      asyncMap((options, cb) => {
        if (options.movieAid) {
          cb(null, options)
        } else {
          getRandomUnwatched(username, (err, movie) => {
            if (err) {
              cb(err)
            } else {
              dispatch(prefer(username, movie.id, callback))
              cb(null, false)
            }
          }) 
        }
      }),
      filter((options) => options),
      asyncMap(getPair),
      filter((movieId) => {
        if (!movieId) // no pair case -> have you seen
        return movieId
      }),
      asyncMap((movieBId, cb) => {
        getMovies([options.movieAId, movieBId], cb)
      }),
      asyncMap((movies, cb) => {
        command.prompt(preferQuestion(movies), (answer) => {
          cb(null, { movies, winnerId: answer.winner})
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
      onEnd(() => {
        dispatch(haveYouSeen(callback))
        // if isSeeding seed
      })
    )
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

function update (prop, value) {
  return {
    type: UPDATE,
    payload: { prop, value }
  }
}

function checkNewUser (username) {
  return (dispatch, getState) => {
    const { command, callback } = getState()
    
    exists('users', { username }, (err, userExists) => {
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

function handleError (err) {
  console.log(err)
}

