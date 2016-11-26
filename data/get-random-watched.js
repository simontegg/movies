const db = require('../data')

module.exports = function (username, callback) {
  db('movies')
    .leftJoin('user_movies', 'user_movies.movie_id', '=', 'movies.id')
    .where({ 'user_movies.username': username, 'user_movies.watched': true })
    .orderByRaw('RANDOM()')
    .limit(1)
    .select()
    .asCallback((err, rows) => {
      if (err) callback(err)
      else callback(err, rows[0])          
    })
}
