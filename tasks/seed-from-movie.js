const MovieDb = require('moviedb')(process.env.MOVIEDB_KEY)

// pull-streams
const pull = require('pull-stream')
const values = require('pull-stream/sources/values')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')
const collect = require('pull-stream/sinks/collect')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
const unique = require('pull-stream/throughs/unique')

// db
const db = require('../data')
const exists = require('../data/exists')
const insert = require('../data/insert')
const find = require('../data/find')

// lib
const filterCrew = require('../lib/filter-crew')
const filterCastCrew = require('../lib/filter-cast-crew')
const mapToCredit = require('../lib/map-to-credit')

// tasks
const fetchMovieCredits = require('./fetch-movie-credits')
const movieDetails = require('./movie-details')

const reduce = require('lodash.reduce')
const concat = require('lodash.concat')
const includes = require('lodash.includes')
const some = require('lodash.some')

module.exports = function (movieId, callback) {
  console.log({movieId})
  pull(
    once(movieId),
    asyncMap((movieId, cb) => {
      find('cast_crew', { movie_id: movieId }, cb)
    }),
    flatten(),
    map((row) => row.person_id),
    unique(),
    collect((err, personIds) => {
      fetchMoviesFromPeople(personIds, callback) 
    })
  )
}

function fetchMoviesFromPeople (personIds, callback) {
  pull(
    values(personIds),
    asyncMap((personId, cb) => {
      MovieDb.personCombinedCredits({ id: personId }, cb)
    }),
    map((res) => {
      return concat(
        extractMovieIds(res.cast), 
        extractMovieIds(res.crew, filterCrew)
      )
    }),
    flatten(),
    unique(),
    asyncMap((movieId, cb) => {
      exists('movies', { id: movieId }, (err, movieExists) => {
        if (err) {
          cb(err)
          return
        }
        if (movieExists) cb(null, false)
        else cb(null, movieId)
      })
    }),
    filter((movieId) => movieId),
    asyncMap((movieId, cb) => {
      MovieDb.movieCredits({ id: movieId }, (err, response) => {
        if (err) cb(err)
        else cb(null, { movieId, response })
      })
    }),
    filter((movie) => {
      const response = movie.response

      return containsCreative(
        concat(response.cast, response.crew), 
        personIds
      )
    }),
    asyncMap((movie, cb) => {
      const { movieId, response } = movie
      jobs(movieId, concat(response.cast, response.crew), cb)
    }),
    onEnd(callback)
  )
}

function noop () {}

function jobs (movieId, credits, callback) {
  let doneCount = 0

  function done (err) {
    if (err) { 
      callback(err)
      return
    }
    
    doneCount ++
    if (doneCount === 2) callback(null, movieId)
  }

  movieDetails(movieId, done)
  handleCredits(movieId, credits, done)
}

function handleCredits (movieId, credits, callback) {
  pull(
    values(credits),
    filter(filterCastCrew),
    asyncMap((credit, cb) => {
      exists(
        'cast_crew', 
        { id: credit.credit_id }, 
        (err, creditExists) => {
          if (err) {
            cb(err)
            return
          }
          if (creditExists) cb(null, false)
            else cb(null, credit)
        })
    }),
    filter((credit) => credit),
    unique((credit) => {
      const row = mapToCredit(movieId, credit)
      return `${row.job}-${row.person_id}-${row.movie_id}` 
    }),
    asyncMap((credit, cb) => {
      insert('cast_crew', mapToCredit(movieId, credit), cb)
    }),
    onEnd(callback)
  )
}

function containsCreative (credits, personIds) {
  return some(credits, (credit) => {
    return isMainCrew(personIds, credit) || isMainActor(personIds, credit)
  })
}

function isMainCrew (personIds, credit) {
  return filterCrew(credit) && includes(personIds, credit.id)
}

function isMainActor (personIds, credit) {
  return credit.order < 3 && includes(personIds, credit.id)
}

function extractMovieIds (credits, filter) {
  return reduce(credits, (memo, credit) => {
    if (credit.media_type === 'movie') {
      if (filter && filter(credit)) {
        memo.push(credit.id)
      } else {
        memo.push(credit.id)
      }
    }
    return memo
  }, [])
}

