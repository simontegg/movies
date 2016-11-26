const db = require('../data')

module.exports = function (username, movie_id, callback) {
  db('user_movies')
    .where({ username, movie_id })
    .select()
    .asCallback((err, rows) => {
      callback(null, rows[0].elo)
    })
}
