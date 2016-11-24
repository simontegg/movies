const db = require('./index')

module.exports = insert

function insert (table, data, callback) {
  db(table).insert(data).asCallback(callback)
}

