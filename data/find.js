const db = require('./index')

module.exports = find

function find (table, query, callback) {
  db(table).where(query).select().asCallback(callback)
}
