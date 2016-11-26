const { UPDATE } = require('../constants')

module.exports = function update (prop, value) {
  return {
    type: UPDATE,
    payload: { prop, value }
  }
}
