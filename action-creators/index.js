// db
const insert = require('../data/insert')
const exists = require('../data/exists')

// action-creators
const update = require('./update')
const haveYouSeen = require('./have-you-seen')
const predict = require('./predict')

// tasks
const favouriteMovie = require('../tasks/favourite-movie')
const seedFromMovie = require('../tasks/seed-from-movie')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const onEnd = require('pull-stream/sinks/on-end')
const asyncMap = require('pull-stream/throughs/async-map')

module.exports = {
  login,
  haveYouSeen,
  predict
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

