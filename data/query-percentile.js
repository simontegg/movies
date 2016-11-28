const db = require('./index')

module.exports = function ({table, queryString, column, percentile}, callback) {
  db.raw(`SELECT ${column} AS ${column}_${percentile} 
    FROM ${table} 
    WHERE ${queryString} 
    ORDER BY ${column} ASC 
    LIMIT 1 
    OFFSET (SELECT 
      COUNT(*) 
      FROM ${table} 
      WHERE ${queryString}) * ${percentile} / 100 - 1;`)
  .asCallback((err, res) => {
    if (err) callback(err)
    else callback(null, res[0])
  })
}
