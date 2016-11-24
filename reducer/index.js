const { UPDATE } = require('../constants')

module.exports = reducer

function reducer (state, action) {
  switch (action.type) {
    case UPDATE:
      return Object.assign(
        {}, 
        state, 
        { [action.payload.prop]: action.payload.value }
      )
    default:
      return state
  } 
}

