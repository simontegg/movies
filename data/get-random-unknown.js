
const shuffle = require('lodash.shuffle')
const db = require('../data')

module.exports = function (username, callback) {
  const fields = ['tomato_meter', 'tomato_user_meter', 'boxoffice', 'imdb_rating']

  db('user_movies')
    .where( { username })
    .andWhere(function () {
      this.where('watched', false).orWhere('watched', true)
    })
    .select('movie_id')
    .asCallback((err, rows) => {
      db('movies')
        .whereNotIn('id', rows.map((row) => row.movie_id))
        .orderBy(shuffle(fields)[0], 'desc')
        .select()
        .asCallback((err, rows) => {
          if (err) return callback(err)
          else callback(null, rows[0])
        })
    })
}
