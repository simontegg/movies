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

const mapToCredit = require('./lib/map-to-credit')

const db = require('./data')

module.exports = function (movieTitle) {
  // through stream
  return pull(
    asyncMap((credit, cb) => {
      console.log({credit})
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
      const row = mapToCredit(movieTitle, credit)
      return `${row.job}-${row.person_id}-${row.movie_id}` 
    }),
    asyncMap((credit, cb) => {
      db('cast_crew')
      .insert(mapToCredit(movieTitle, credit))
      .asCallback(cb)
    })
  ) 
}
