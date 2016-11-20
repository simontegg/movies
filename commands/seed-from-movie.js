const MovieDb = require('moviedb')(process.env.MOVIEDB_KEY)

// pull-streams 
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const onEnd = require('pull-stream/sinks/on-end')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
const unique = require('pull-stream/throughs/unique')

const db = require('../data')
const filterCastCrew = require('../lib/filter-cast-crew')
const rating = require('./movie-rating')
const moviePeople = require('./movie-people')
const mapToCredit = require('../lib/map-to-credit')

module.exports = function (movieId, callback) {
  
  MovieDb.movieCredits({ id: movieId }, (err, res) => {
    console.log(err, res)
    pull(
      once(res.cast.concat(res.crew)),
      flatten(),
      filter(filterCastCrew),
      asyncMap((credit, cb) => {
        db('cast_crew')
        .where('id', credit.credit_id)
        .select()
        .asCallback((err, rows)  => {
          if (rows.length === 0) cb(null, credit)
          else cb(null, false)
        })
      }),
      filter((credit) => credit),
      unique((credit) => {
        const row = mapToCredit(movieId, credit)
        return `${row.job}-${row.person_id}-${row.movie_id}` 
      }),
      asyncMap((credit, cb) => {
        db('cast_crew')
        .insert(mapToCredit(movieId, credit))
        .asCallback(cb)
      }),
      onEnd(() => moviePeople(movieId, callback))
    )
  })
}
