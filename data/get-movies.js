const db = require('./index')

module.exports = function getMovies (ids, callback) {
  db('movies').whereIn('id', ids).select().asCallback(callback)
}
