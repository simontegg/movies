
const MovieDb = require('moviedb')(process.env.MOVIEDB_KEY)





// pull-streams
const pull = require('pull-stream')
const values = require('pull-stream/sources/values')
const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
const unique = require('pull-stream/throughs/unique')

const db = require('../data')
const filterCastCrew = require('../lib/filter-cast-crew')
const filmography = require('../filmography')
const rating = require('../rating')
const moviePeople = require('../movie-people')
const insertCredit = require('../insert-credit')
const mapToCredit = require('../lib/map-to-credit')

let movieId


module.exports = function (query, callback) {
  MovieDb.searchMovie({ query }, (err, response) => {
    callback(null, response.results)
  })
}
