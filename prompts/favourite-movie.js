const searchMovie = require('../commands/search-movie')
const seedFromMovie = require('../commands/seed-from-movie')
const confirmMovie = require('../commands/confirm-movie')
const fetchMovieData = require('../commands/movie-rating')
const db = require('../data')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
const unique = require('pull-stream/throughs/unique')

const question = {
  type: 'input',
  name: 'query',
  message: 'Enter the title of a favourite movie: ',
}

module.exports = function (username, callback) {
  this.prompt(question, (answer) => {
    pull(
      once(answer.query),
      asyncMap(searchMovie),
      asyncMap((results, cb) => {
        this.prompt(confirmMovie(results), (result) => cb(null, result))
      }),
      map((result) => result.movieId),
      map((movieId) => {
        this.seeding = true
        this.log('seeding database with similar movies...')
        return movieId
      }),
      asyncMap((movieId, cb) => asyncJobs(username, movieId, cb)),
      onEnd(() => {
        this.seeding = false
        callback()
      })
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
      if (doneCount === jobs.length) callback(null, 'done')
    }
  }

  jobs.forEach((job) => job(movieId, done))
}

