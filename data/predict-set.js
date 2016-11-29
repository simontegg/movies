const db = require('../data')

module.exports = function (username, callback) {
  db.raw(`SELECT * FROM movies
    LEFT JOIN user_movies ON movies.id = user_movies.movie_id
    JOIN genres ON genres.movie_id = movies.id
    JOIN cast_crew ON cast_crew.movie_id = movies.id
    WHERE watched IS NULL OR (watched IS 0 AND username = '${username}')`)
    .asCallback(callback)
}
