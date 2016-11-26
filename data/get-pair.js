const db = require('./index')

module.exports = function getPair ({username, movieAId}, callback) {
  db('user_movies')
  .leftJoin('movies_elo', function () {
    this
    .on('user_movies.movie_id', '=', 'movies_elo.movie_a')
    .orOn('user_movies.movie_id', '=', 'movies_elo.movie_b')
  })
  .where(function () {
    if (movieAId) {
      this
      .where({ 'user_movies.username': username, watched: true })
      .andWhereNot('user_movies.movie_id', movieAId)
    } else {
      this.where({ 'user_movies.username': username, watched: true })
    }
  })
  .orderByRaw('RANDOM()')
  .limit(1)
  .select()
  .asCallback((err, rows) => {
    callback(err, getMovieid(rows))          
  })
}

function getMovieid (rows) {
  return rows[0] ? rows[0].movie_id : null
}

