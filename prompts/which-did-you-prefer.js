const db = require('../data')
const haveYouSeen = require('./have-you-seen')

const question = {
  type: 'list',
  name: 'preference',
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
    getPair(options, (err, movieBId) => {
      if (movieBId) getMovies([options.movieId, movieBId], (err, movies) => {
      prompt.call(this, makeQuestion(movies), (answer) => {
        console.log(answer)
      })
      
    })
  })
  
}

}

function prompt (question, callback) {
  this.prompt(question, callback)
}

function makeQuestion (movies) {
  return Object.assign({}, question, { choices: movies.map(makeChoice) })
}

function makeChoice (movie) {
  return `${movie.title} (${movie.year})`
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

