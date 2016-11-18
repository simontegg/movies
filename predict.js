// pull-streams
const pull = require('pull-stream')
const values = require('pull-stream/sources/values')
const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')
const collect = require('pull-stream/sinks/collect')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
const unique = require('pull-stream/throughs/unique')
const sort = require('pull-sort')

const db = require('./data')
const limdu = require('limdu')
const zip = require('lodash.zipobject')

const movieClassifier = new limdu.classifiers.multilabel.PassiveAggressive({
  Constant: 5.0,
  retrain_count: 10
})

predict()

function predict () {
  db('movies')
    .whereNotNull('tomato_meter')
    .select()
    .asCallback((err, rows) => {
      
      pull(
        values(rows),
        asyncMap((movie, cb) => {
          db('cast_crew')
            .where('movie_id', movie.id)
            .select()
            .asCallback((err, credits) => {
              cb(null, { movie, credits })
            })
        }),
        map((d) => {
          return movieClassifier.trainOnline(input(d.credits), output(d.movie))
        }),
        onEnd(() => {
          rankCreatives(movieClassifier)
        })
      )
    })
}


function rankCreatives (classifier) {
  db('cast_crew').select().asCallback((err, credits) => {
    pull(
      values(credits),
      unique((credit) => `${credit.job}-${credit.person_id}`),
      map((credit) => {
        const personRole = personKey(credit)
        return { 
          personRole, 
          scores: classifier.classify({ [personRole]: 1 }, 0, true)
        }
      }),
      map((result) => {
        result.score = getTrueScore(result.scores)
        delete result.scores
        return result
      }),
      sort((a, b) => b.score - a.score),
      collect((err, results) => {
        console.log(results)
      })
    )
  })
}

function getTrueScore (scores) {
  if (scores[0][0] === 'true') return scores[0][1]
  else return scores[1][1]
}

function personKey (credit) {
  return `${credit.job}-${credit.name}-${credit.person_id}`
}

function input (credits) {
  return zip(
    credits.map((c) => `${c.job}-${c.name}-${c.person_id}`),
    credits.map((c) => 1)
  )
}

function output (movie) {
  return movie.tomato_meter > 69
}


