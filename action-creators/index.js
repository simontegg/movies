// db
const insert = require('../data/insert')
const exists = require('../data/exists')

// tasks
const favouriteMovie = require('../tasks/favourite-movie')
const seedFromMovie = require('../tasks/seed-from-movie')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const onEnd = require('pull-stream/sinks/on-end')
const many = require('pull-many')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')

// constants
const { UPDATE } = require('../constants')

module.exports = {
  login
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
    const { command } = getState()
    
    exists('users', { username }, (err, userExists) => {
     // if (userExists) dispatch(greeting(command, username))
     // else dispatch(newUser(username))
      dispatch(newUser(username))
    })
  }
}

function newUser (username) {
  return (dispatch, getState) => {
    const { command } = getState()
    pull(
      once(username),
      asyncMap((x, cb) => insert('users', { username }, cb)),
      asyncMap((x, cb) => favouriteMovie(command, username, cb)),
      asyncMap((movieId, cb) => {
        dispatch(update('seeding', true)) 
        seedFromMovie(movieId, cb)
      }),
      onEnd(() => {
        dispatch(update('seeding', false))
      })
    )
  }
}

function handleError (err) {
  console.log(err)
}

