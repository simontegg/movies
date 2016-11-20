
const shuffle = require('lodash.shuffle')
const db = require('../data')

module.exports = function (username, callback) {
  const fields = ['tomato_meter', 'tomato_user_meter', 'boxoffice']
  console.log('getRandomUnwatched 2', username)

  db('movies')
    .leftJoin('user_movies', 'user_movies.movie_id', '=', 'movies.id')
    .whereNull('user_movies.watched')
    .orderBy(shuffle(fields)[0], 'desc')
    .select()
    .asCallback(callback)
}
