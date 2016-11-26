const db = require('./index')

module.exports = update

function update (table, query, data, callback) {
  db(table).where(query).update(data).asCallback(callback)
}
