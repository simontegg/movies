const db = require('../data')

module.exports = function (query, callback) {
  db('user_movies')
    .join('movies', 'movies.id', 'user_movies.movie_id')
    .join('genres', 'genres.movie_id', 'movies.id')
    .join('cast_crew', 'cast_crew.movie_id', 'movies.id')
    .whereNotNull('elo')
    .andWhere(query)
    .asCallback(callback)
}
