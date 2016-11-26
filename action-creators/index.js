// modules
const extend = require('xtend')

// db
const insert = require('../data/insert')
const exists = require('../data/exists')
const getPair = require('../data/get-pair')
const getMovies = require('../data/get-movies')
const seen = require('../data/seen')

// tasks
const favouriteMovie = require('../tasks/favourite-movie')
const seedFromMovie = require('../tasks/seed-from-movie')

// lib
const getRandomUnwatched = require('../lib/get-random-unwatched')
const getLoserId = require('../lib/get-loser-id')
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

function haveYouSeen (username, callback) {
  return (dispatch, getState) => {
    console.log('haveYouSeen')
    const { command, username } = getState() 

    pull(
      once(username),
      asyncMap(getRandomUnwatched),
      asyncMap((movie, cb) => {
        console.log('prompting', movie.title)
        command.prompt(seenMovie(movie), (answer) => {
          cb(null, { response: answer.response, movieId: movie.id })
        })
      }),
      asyncMap((res, cb) => {
        const { response, movieId } = res

        if (response === 'yes') {
          seen({ username, movieId, watched: true }, (err) => {
            if (err) cb(err)
            else cb(null, movieId)
          })
        } else {
          seen({ username, movieId, watched: false }, (err) => {
            if (err) {
              cb(err)
            } else {
              dispatch(haveYouSeen(username, callback))
              cb(null, false)
            }
          })
        }
      }),
      filter((movieId) => movieId),
      map((movieAId) => {
        dispatch(prefer({ username, movieAId }, callback))
        return movieAId
      }),
      drain(() => {
        console.log('drain')
      })
    )
  }
}

function prefer (options, callback) {
  return (dispatch, getState) => {
    const { username, movieAId, movieBId } = options
    const { command } = getState()
    
    pull(
      once(options),
      asyncMap((options, cb) => {
        if (!movieAId && !movieBid) {
          getRandomUnwatched(username, (err, movie) => {
            cb(null, false)
            dispatch(prefer(
                extend(options, { movieAId: movie.id }), 
                callback
            ))
          })
        } else {
          console.log('first condition passed')
          cb(null, options)
        }
      }),
      filter((options) => options),
      asyncMap((options, cb) => {
        if (movieAId && !movieBId) {
          getPair(options, (err, movieBId) => {
            console.log('got pair', extend(options, { movieBId }))
            cb(null, false)
            dispatch(prefer(extend(options, { movieBId }), callback))
          })
        } else if (movieAId && movieBId) {
          console.log('second condition')
          cb(null, options)
        }
      }),
      filter((options) => options),
      asyncMap((options, cb) => {
        console.log('getting movies')
        getMovies([movieAId, movieBId], cb)
      }),
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
      drain(() => {
        console.log('matched')
        //dispatch(haveYouSeen(callback))
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

