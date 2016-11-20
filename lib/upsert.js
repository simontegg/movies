const db = require('../data')

module.exports = function (table, data, callback) {
  db(table)
    .where(data)
    .select()
    .asCallback((err, rows) => {
      if (rows.length === 0) {
        db(table).insert(data).asCallback(callback)
      } else {
        db(table).where('id', rows[0].id).update(data).asCallback(callback)
      }
    })
}



