const seed = require('./seed')
const searchMovie = require('../commands/search-movie')
const confirmMovie = require('../commands/confirm-movie')
const { favourite } = require('../questions')
const db = require('../data')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')

module.exports = () => (dispatch, getState) => {
  const { command, username } = getState()

  command.prompt(favourite, (answer) => {
    pull(
      once(answer.query),
      asyncMap(searchMovie),
      asyncMap((results, cb) => {
        command.prompt(confirmMovie(results), (result) => {
          cb(null, result.movieId)
        })
      }),
      asyncMap((movieId, cb) => asyncJobs(username, movieId, cb)),
      drain((movieId) => dispatch(seed(movieId)))
    )
  })
}

const insertFavourite = (username) => (movieId, callback) => {
  db('user_movies')
    .insert({ username, movie_id: movieId, watched: true, favourite: true })
    .asCallback(callback)
}

function asyncJobs (username, movieId, callback) {
  let doneCount = 0
  const jobs = [fetchMovieData, insertFavourite(username), seedFromMovie]

  function done (err) {
    if (err) {
      callback(err)
    } else {
      doneCount ++
      console.log('done', doneCount)
      if (doneCount === jobs.length) callback(null, movieId)
    }
  }

  jobs.forEach((job) => job(movieId, done))
}

