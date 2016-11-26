const db = require('./index')

module.exports = upsert

function upsert (table, query, data, callback) {
  db(table)
    .where(query)
    .select()
    .asCallback((err, rows) => {
      if (rows.length === 0) {
        db(table).insert(Object.assign({}, query, data)).asCallback(callback)
      } else {
        db(table).where(query).update(data).asCallback(callback)
      }
    })
}
