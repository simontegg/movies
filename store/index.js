const { createStore, applyMiddleware, compose } = require('redux')
const thunk = require('redux-thunk').default
const multi = require('redux-multi').default
const reducer = require('../reducer')

const initState = {
  username: null,
  seeding: false,
  command: null,
  next: null,
  args: [],
}

module.exports = applyMiddleware(thunk, multi)(createStore)(reducer, initState)
