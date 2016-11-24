
// action-creators
const favouriteMovie = require('./favourite-movie')

// pull-streams
const pull = require('pull-stream')
//const values = require('pull-stream/sources/values')
const once = require('pull-stream/sources/once')
//const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')
const many = require('pull-many')
//const collect = require('pull-stream/sinks/collect')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
//const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
//const unique = require('pull-stream/throughs/unique')
//const pair = require('pull-pair')

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
    
    exists({ table: 'users', username }, (err, userExists) => {
      if (userExists) dispatch(greeting(command, username))
      else dispatch(newUser(username))
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



