const { createStore, applyMiddleware, compose } = require('redux')
const { install } = require('redux-loop')
const reducer = require('../reducer')

const initState = {
  currentUser: null,
  seeding: false,
  command: null
}

const enhancer = compose(
  install()
)

module.exports = createStore(
  reducer,
  initState,
  enhancer
)
