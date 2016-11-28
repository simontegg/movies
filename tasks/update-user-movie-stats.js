const db = require('../data')
const queryPercentile = require('../data/query-percentile')
const extend = require('xtend')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const onEnd = require('pull-stream/sinks/on-end')
const asyncMap = require('pull-stream/throughs/async-map')

module.exports = function (username, callback) {
  pull(
    once(username),
    asyncMap(getPercentiles),
    asyncMap((percentiles, cb) => {
      updatePercentiles(username, percentiles, cb)
    }),
    onEnd(callback)
  )
}


function updatePercentiles (username, percentiles, callback) {
  let doneCount = 0

  function done (err) {
    if (err) {
      callback(err)
    } else {
      doneCount++
      if (doneCount === 4) callback(err, percentiles)
    }
  }

  Object.keys(percentiles).forEach((column) => {
    db('user_movies')
      .where({ username })
      .andWhere('elo', '>=', percentiles[column])
      .update(column, true)
      .asCallback(done)
  })

  Object.keys(percentiles).forEach((column) => {
    db('user_movies')
      .where({ username })
      .andWhere('elo', '<', percentiles[column])
      .update(column, false)
      .asCallback(done)
  })
}


function percentileOptions (username, percentile) {
  const column = 'elo'
  return {
    table: 'user_movies',
    column: 'elo',
    queryString: `username='${username}' AND ${column} IS NOT NULL`,
    percentile
  }
}


function getPercentiles (username, callback) {
  let doneCount = 0
  let result = {}

  function done (err, res) {
    if (err) {
      callback(err)
    } else {
      result = extend(result, res) 
      doneCount++
        if (doneCount === 2) callback(null, result)
    }
  }

  ;[90, 70].forEach((percentile) => {
    queryPercentile(percentileOptions(username, percentile), done)
  })
}

