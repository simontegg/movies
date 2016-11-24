// main
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

// db
const db = require('../data')
const exists = require('../data/exists')
const insert = require('../data/insert')

// lib
const filterCastCrew = require('../lib/filter-cast-crew')
const mapToCredit = require('../lib/map-to-credit')

module.exports = function (movieId, callback) {
  MovieDb.movieCredits({ id: movieId }, (err, res) => {
    pull(
      once(res.cast.concat(res.crew)),
      flatten(),
      filter(filterCastCrew),
      asyncMap((credit, cb) => {
        exists(
          'cast_crew',
          { id: credit.credit_id }, 
          (err, creditExists) => {
            if (err) cb(err)
            if (creditExists) cb(null, false)
            else cb(null, credit)
          }
        )
      }),
      filter((credit) => credit),
      unique((credit) => {
        const row = mapToCredit(movieId, credit)
        return `${row.job}-${row.person_id}-${row.movie_id}` 
      }),
      asyncMap((credit, cb) => {
        insert('cast_crew', mapToCredit(credit, movieId), cb) 
      }),
      onEnd(() => callback(null, movieId))
    )
  })
}
