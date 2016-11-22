const { createStore, applyMiddleware } = require('redux')
const thunk = require('redux-thunk')
const multi = require('redux-multi')
const reducer = require('../reducer')

const initState = {
  currentUser: null,
  seeding: false,
  command: null
}

module.exports = createStore(
  reducer,
  initState,
  applyMiddleware(thunk, multi)
)
