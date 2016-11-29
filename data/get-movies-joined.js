const db = require('./index')

module.exports = function (username, ids, callback) {
  console.log({username, ids, callback})
  db('movies')
    .leftJoin('user_movies', 'user_movies.movie_id', 'movies.id')
    .whereIn('id', ids)
    .select()
    .asCallback((err, rows) => {
      console.log(err, rows)
      callback(err, rows)
    })
}
