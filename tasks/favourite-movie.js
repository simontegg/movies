// tasks 
const movieDetails = require('./movie-details')
const searchMovie = require('./search-movie')
const fetchMovieCredits = require('./fetch-movie-credits')

// questions
const { confirmMovie, favourite } = require('../questions')

// db
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
      asyncMap((movieId, cb) => fetchAndSave(username, movieId, cb)),
      asyncMap(fetchMovieCredits),
      drain((movieId) => callback(null, movieId))
    )
  })
}

function fetchAndSave (username, movieId, callback) {
  let doneCount = 0

  function done (err) {
    if (err) callback(err)
    doneCount ++
    if (doneCount === 2) callback(null, movieId)
  }

  insert(
    'user_movies', 
    { username, movie_id: movieId, favourite: true, watched: true },
    done
  )

  movieDetails(movieId, done)
}
