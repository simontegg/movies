// action-creators
const seedCheck = require('./seed-check')

// db
const getPair = require('../data/get-pair')
const getMovies = require('../data/get-movies')
const getRandomWatched = require('../data/get-random-watched')
const queryPercentile = require('../data/query-percentile')
const trainingSet = require('../data/training-set')
const predictSet = require('../data/predict-set')

// modules
const extend = require('xtend')
const defined = require('defined')
const limdu = require('limdu')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const asyncMap = require('pull-stream/throughs/async-map')
const map = require('pull-stream/throughs/map')
const flatten = require('pull-stream/throughs/flatten')
const sort = require('pull-sort')
const values = require('pull-stream/sources/values')
const filter = require('pull-stream/throughs/filter')
const reduce = require('pull-stream/sinks/reduce')
const collect = require('pull-stream/sinks/collect')
const many = require('pull-many')
const take = require('pull-stream/throughs/take')
const unique = require('pull-stream/throughs/unique')
const merge = require('pull-merge')

// tasks
const updateUserMovieStats = require('../tasks/update-user-movie-stats') 


module.exports = predict

function predict (callback) {
  return (dispatch, getState) => {
    const { username } = getState()
    pull(
      once(username),
      asyncMap(updateUserMovieStats),
      asyncMap((res, cb) => {
        getClassifierAndPredict(username, cb)
      }),
      drain(({classifier, predictObject}) => {
       // console.log(Object.keys(predictObject))
        pull(
          values(classifyMovies(classifier, predictObject)),
          sort((a, b) => b.score - a.score),
          take(10),
          collect(callback)
        )
      })
    )
  }
}

function getClassifierAndPredict (username, callback) {
  let doneCount = 0
  let results = {}

  function done (err, result) {
    console.log('done', Object.keys(result))
    if (err) {
      callback(err)
    } else {
      doneCount++
        results = extend(results, result)
      if (doneCount === 2) callback(null, results)
    }
  }

  getClassifier(username, done)
  getPredictObject(username, done)
}

function getClassifier (username, callback) {
  pull(
    once(username),
    asyncMap(getTrainingObject),
    map(train),
    drain((classifier) => callback(null, { classifier }))
  )
}

function getTrainingObject (username, callback) {
  pull(
    once(username),
    asyncMap(updateUserMovieStats),
    asyncMap((res, cb) => {
      trainingSet({ username }, cb)
    }),
    flatten(),
    reduce(reducer, {}, callback)
  )
}

function train (movieObject) {
  const movieClassifier = new limdu.classifiers.multilabel.PassiveAggressive({
    Constant: 5.0,
    retrain_count: 10
  })

  Object.keys(movieObject).forEach((key) => {
    const movie = movieObject[key]
    const output = movie.output
    delete movie.output
    movieClassifier.trainOnline(movie, output)
  })

  return movieClassifier
}

function getPredictObject (username, callback) { 
  pull(
    once(username),
    asyncMap((username, cb) => {
      predictSet(username, cb)
    }),
    flatten(),
    reduce(
      reducer, 
      {}, 
      (err, predictObject) => callback(null, { predictObject })
    )
  )
}

function classifyMovies (classifier, predictObject) {
  return Object.keys(predictObject).map((key) => {
    const movie = predictObject[key]
    delete movie.output
   // console.log(getTrueScore(classifier.classify(movie, 0, true)))
    return {
      movieId: key,
      score: getTrueScore(classifier.classify(movie, 0, true))
    }
  })
}

function getTrueScore (scores) {
  if (scores[0][0] === 'true') return scores[0][1]
    else return scores[1][1]
}

function reducer (memo, row) {
  const { movie_id, genre } = row
  const role = personKey(row)
  const isAudienceFav = (row.tomato_user_meter >= 90) ? 1 : 0
  const isAudienceLike = (row.tomato_user_meter >= 70) ? 1 : 0
  const isCriticFav = (row.tomato_meter >= 90) ? 1 : 0
  const isCriticLike = (row.tomato_meter >= 70) ? 1 : 0

  memo[movie_id] = memo[movie_id] || {}

  memo[movie_id].output = defined(memo[movie_id].output, row.elo_70)


  // memo[movie_id][genre] = memo[movie_id][genre] || 1
  memo[movie_id][role] = memo[movie_id][role] || 1
  memo[movie_id].audienceFav = defined(memo[movie_id].audienceFav, isAudienceFav)
  memo[movie_id].audienceLike = defined(memo[movie_id].audienceLike, isAudienceLike)
  memo[movie_id].criticFav = defined(memo[movie_id].criticFav, isCriticFav)
  memo[movie_id].criticLike = defined(memo[movie_id].criticLike, isCriticLike)

  return memo
}

function genreKey (row) { return `g:${row.genre}` }

function personKey (credit) {
  return `p:${credit.job}-${credit.name}-${credit.person_id}`
}
