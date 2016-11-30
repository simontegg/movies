const db = require('./index')
const reduce = require('lodash.reduce')
const map = require('lodash.map')

module.exports = function (username, ids, callback) {
  db('movies')
    .leftJoin('user_movies', 'user_movies.movie_id', 'movies.id')
    .join('genres', 'genres.movie_id', 'movies.id')
    .whereIn('id', ids)
    .andWhere(function () {
      this.whereNull('username').orWhere({ username })
    })
    .select()
    .asCallback((err, rows) => {
      const consolidated = reduce(rows, (memo, row) => {
        memo[row.id] = memo[row.id] || row
        memo[row.id].genres = memo[row.id].genres || []
        memo[row.id].genres.push(row.genre)
        return memo
      }, {})

      callback(err, map(consolidated))
    })
}
