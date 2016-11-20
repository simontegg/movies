const dotenv = require('dotenv')
dotenv.load()
const MovieDb = require('moviedb')(process.env.MOVIEDB_KEY)
const request = require('superagent')
const moment = require('moment')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const onEnd = require('pull-stream/sinks/on-end')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')

const db = require('../data')
const filterCastCrew = require('../lib/filter-cast-crew')

module.exports = function (movieId, callback) {
  pull(
    once(movieId),
    asyncMap((movieId, cb) => {
      db('movies').where('id', movieId).select().asCallback((err, rows) => {
        if (rows && rows.length === 0) cb(null, movieId)
        else cb(null, false)
      })
    }),
    filter((movieId) => movieId),
    asyncMap((movieId, cb) => MovieDb.movieInfo({ id: movieId }, cb)),
    asyncMap((movieInfo, cb) => request.get(omdbUrl(movieInfo.imdb_id), cb)),
    asyncMap((response, cb) => {
      saveMovie(movieId, response.body, (err, rows) => {
        if (err) cb(err)
        else cb(null, response)
      })
    }),
    asyncMap((response, cb) => saveGenres(movieId, response.body.Genre, cb)),
    onEnd(() => {
      console.log('movie saved', movieId)
      callback()
    })
  )
}

function omdbUrl (imdbId) {
  return `https://www.omdbapi.com/?i=${imdbId}&tomatoes=true`
}

function saveGenres (id, genreString, callback) {
  if (genreString) {
    db('genres')
    .insert(genreString.split(',').map((genre) => (
      { movie_id: id, genre: genre.trim() }
    )))
    .asCallback(callback)
  } else {
    callback(null) 
  }
}

function saveMovie (id, body, callback) {
  console.log(body.Title)
  db('movies')
  .where('id', id)
  .select()
  .asCallback((err, rows) => {
    if (rows.length === 0) {
      db('movies')
      .insert(responseToRow(id, body))
      .asCallback(callback)
    } else {
      callback(null, [])
    }
  })
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
