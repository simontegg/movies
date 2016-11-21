const db = require('../data')
const haveYouSeen = require('./have-you-seen')
const eloMatch = require('../lib/elo-match')
const seed = require('../lib/seed')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
const unique = require('pull-stream/throughs/unique')

const question = {
  type: 'list',
  name: 'winner',
  message: 'Which did you prefer?'
}

module.exports = whichDidYouPrefer

// if movieId
//  find movie watched:true, matched with movieA: false
// else
//  find movie watched:true as movieA
//  find movie watched:true as movieB

function whichDidYouPrefer (options, callback) {
  if (options.movieId) {
    let matchingMovies

    getPair(options, (err, movieBId) => {
      if (movieBId) {
        pull(
          once(movieBId),
          asyncMap((movieBId, cb) => {
            getMovies([options.movieId, movieBId], cb)
          }),
          asyncMap((movies, cb) => {
            matchingMovies = movies 
            this.prompt(makeQuestion(movies), (answer) => {
              cb(null, answer)
            })
          }),
          asyncMap((answer, cb) => {
            const winnerId = answer.winner

            eloMatch(
              options.username, 
              winnerId, 
              getLoserId(matchingMovies, winnerId), 
              cb
            )
          }),
          drain(() => {
      //      if (!this.seeding) seed(options.username, winnerId)
            callback()
          })
        )
      }
    })
  }
}

function getLoserId (movies, winnerId) {
  return movies.filter((movie) => movie.id !== winnerId)[0].id
}

function makeQuestion (movies) {
  return Object.assign({}, question, { choices: movies.map(makeChoice) })
}

function makeChoice (movie) {
  return { name: `${movie.title} (${movie.year})`, value: movie.id }
}


function getPair ({username, movieId}, callback) {
  db('user_movies')
  .leftJoin('movies_elo', function () {
    this
    .on('user_movies.movie_id', '=', 'movies_elo.movie_a')
    .orOn('user_movies.movie_id', '=', 'movies_elo.movie_b')
  })
  .where(function () {
    if (movieId) {
      this
      .where({ 'user_movies.username': username, watched: true })
      .andWhereNot('user_movies.movie_id', movieId)
    } else {
      this.where({ 'user_movies.username': username, watched: true })
    }
  })
  .orderByRaw('RANDOM()')
  .limit(1)
  .select()
  .asCallback((err, rows) => {
    callback(err, getMovieid(rows))          
  })
}

function getMovies (ids, callback) {
  db('movies').whereIn('id', ids).select().asCallback(callback)
}

function getMovieid (rows) {
  return rows[0] ? rows[0].movie_id : null
}

