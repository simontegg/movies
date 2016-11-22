const { combineReducers } = require('redux')
const { 
  LOGIN, 
  LOGOUT,
  START_SEEDING, 
  FINISHED_SEEDING } = require('../constants')

module.exports = combineReducers({
  currentUser,
  seeding
})

function currentUser (state, action) {
  switch (action.type) {
    case LOGIN:
      return action.payload
    case LOGOUT: 
      return null
    default:
      return null
  } 
}

function seeding (state, action) {
  switch (action.type) {
    case START_SEEDING:
      return true
    case FINISHED_SEEDING: 
      return false
    default:
      return null
  } 
}
