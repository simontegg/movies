const { createStore, applyMiddleware } = require('redux')
const thunk = require('redux-thunk').default
const reducer = require('../reducer')

const initState = {
  currentUser: null,
  seeding: false
}

module.exports = store = createStore(
  reducer,
  initState,
  applyMiddleware(thunk)
)
