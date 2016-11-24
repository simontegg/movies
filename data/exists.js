const db = require('./index')

module.exports = exists

function exists (table, data, callback) {
  db(table)
    .where(data)
    .select()
    .asCallback((err, rows) => {
      if (err) callback(err)
      if (rows.length === 0) callback(null, false)
      else callback(null, true)
    })
}

