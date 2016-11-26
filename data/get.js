const db = require('./index')

module.exports = get

function get (table, query, callback) {
  db(table)
    .where(query)
    .select()
    .asCallback((err, rows) => {
      if (err) callback(err)
      else callback(null, rows[0])
    })
}
