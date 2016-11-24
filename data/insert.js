const db = require('./index')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const asyncMap = require('pull-stream/throughs/async-map')

module.exports = { insert }

function insert ({table, data}, callback) {
  db(table).insert(data).asCallback(callback)
}

function pullInsert (options) {
  return pull(once(options), asyncMap(insert))
}

