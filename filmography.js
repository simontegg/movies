const dotenv = require('dotenv')
dotenv.load()
const MovieDb = require('moviedb')(process.env.MOVIEDB_KEY)

// pull-streams
const pull = require('pull-stream')
const values = require('pull-stream/sources/values')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')

const db = require('./data')
const filterCastCrew = require('./lib/filter-cast-crew')


module.exports = function (personId) {
  return pull(
    once(personId),
    asyncMap((personId, cb) => {
      MovieDb.person.combinedCredits({ id: personId }, cb)
    }),
    filter(filterCastCrew)
  )
}
