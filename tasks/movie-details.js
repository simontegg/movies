// modules
const MovieDb = require('moviedb')(process.env.MOVIEDB_KEY)
const map = require('lodash.map')
const request = require('superagent')
const moment = require('moment')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const onEnd = require('pull-stream/sinks/on-end')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')

// db
const exists = require('../data/exists')
const insert = require('../data/insert')

module.exports = function (movieId, callback) {
  pull(
    once(movieId),
    asyncMap((movieId, cb) => {
      exists('movies', { id: movieId }, (err, movieExists) => {
        if (err) cb(err)
        if (movieExists) cb(null, false)
        else cb(null, movieId)
      })
    }),
    filter((movieId) => movieId),
    asyncMap((movieId, cb) => MovieDb.movieInfo({ id: movieId }, cb)),
    asyncMap((movieInfo, cb) => request.get(omdbUrl(movieInfo.imdb_id), cb)),
    asyncMap((response, cb) => saveMovieInfo(movieId, response.body, cb)),
    onEnd(callback)
  )
}

function saveMovieInfo (movieId, responseBody, callback) {
  let doneCount = 0
  const jobCount = (responseBody.Genre) ? 2 : 1

  function done (err) {
    if (err) {
      callback(err)
      return
    }

    doneCount ++
    if (doneCount === jobCount) callback(null)
  }

  insert('movies', responseToRow(movieId, responseBody), done)

  if (responseBody.Genre) {
    insert(
      'genres', 
      genreStringToRows(movieId, responseBody.Genre.split(',')),
      done
    )
  }
}

function omdbUrl (imdbId) {
  return `https://www.omdbapi.com/?i=${imdbId}&tomatoes=true`
}

function genreStringToRows (movieId, genres) {
  return map(genres, (genre) => 
    ({ movie_id: movieId, genre: genre.trim() })
  )
}

function responseToRow (id, body) {
  return {
    id,
    imdb_id: body.imdbID,
    title: body.Title,
    image: body.Poster,
    runtime: parseInt(body.Runtime),
    year: parseInt(body.Year),
    release_date: moment(body.Released, 'DD MMM YYYY').format('YYYY-MM-DD'),
    rated: body.Rated,
    country: body.Country,
    metascore: parseInt(body.Metascore),
    imdb_rating: parseFloat(body.imdbRating),
    tomato_meter: parseInt(body.tomatoMeter),
    tomato_fresh: (body.tomatoImage === 'certified'),
    tomato_rating: parseFloat(body.tomatoRating),
    tomato_user_meter: parseInt(body.tomatoUserMeter), 
    tomato_user_rating: parseFloat(body.tomatoUserRating), 
    boxoffice: boxOffice(body.BoxOffice),  
    production: body.Production
  }
}

function boxOffice (amount) {
  return amount ? parseInt(amount.replace(/[\.,\$]/g, '')) : null 
}
