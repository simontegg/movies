const db = require('./index')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const asyncMap = require('pull-stream/throughs/async-map')

module.exports = { exists, pullExists }

function exists ({table, data}, callback) {
  db(table)
    .where(data)
    .select()
    .asCallback((err, rows) => {
      if (rows.length === 0) callback(null, false)
      else callback(null, true)
    })
}

function pullExists (options) {
  return pull(once(options), asyncMap(exists))
}
