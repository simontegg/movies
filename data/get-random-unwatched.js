
const shuffle = require('lodash.shuffle')
const db = require('../data')

module.exports = function (username, callback) {
  const fields = ['tomato_meter', 'tomato_user_meter', 'boxoffice', 'imdb_rating']

  db('movies')
    .leftJoin('user_movies', 'user_movies.movie_id', '=', 'movies.id')
    .whereNull('user_movies.username')
    .orWhereNot('user_movies.username', username)
    .orderBy(shuffle(fields)[0], 'desc')
    .select()
    .asCallback((err, rows) => {
      if (err) callback(err)
      else callback(null, rows[0])
    })
}
