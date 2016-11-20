const db = require('../data')

module.exports = function ({ username, movieId, watched }, callback) {
  db('user_movies')
    .insert({ username, movie_id: movieId, watched })
    .asCallback(callback)
}
