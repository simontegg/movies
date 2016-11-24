const searchMovie = require('./search-movie')
const { confirmMovie, favourite } = require('../questions`)
const db = require('../data')
const insert = require('../data/insert')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')

module.exports = (command, username, callback) => {
  command.prompt(favourite, (answer) => {
    pull(
      once(answer.query),
      asyncMap(searchMovie),
      asyncMap((results, cb) => {
        command.prompt(confirmMovie(results), (result) => {
          cb(null, result.movieId)
        })
      }),
      asyncMap((movieId, cb) => {
        insert(
          'user_movies', 
          { username, movie_id: movieId, favourite: true, watched: true },
          (err, res) => cb(null, movieId)
        )
      }),
      asyncMap(fetchMovieCredits),
      drain((movieId) => callback(null, movieId))
    )
  })
}
