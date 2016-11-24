const db = require('./index')

module.exports = insert

function insert (table, data, callback) {
  console.log({table, data })
  db(table).insert(data).asCallback(callback)
}

