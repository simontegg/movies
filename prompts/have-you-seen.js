const getRandomUnwatched = require('../lib/get-random-unwatched')
const seen = require('../lib/seen')
const whichDidYouPrefer = require('./which-did-you-prefer')

const question = {
  type: 'list',
  choices: ['yes', 'no']
}

module.exports = haveYouSeen

function haveYouSeen ({username}, callback) {
  getRandomUnwatched(username, (err, movies) => {
    if (err) callback(err)
    else prompt.call(this, username, movies[0], callback) 
  })
}

function prompt (username, movie, callback) {
  this.prompt(makeQuestion(movie), (answer) => {
    const movieId = movie.id
    if (answer.response === 'yes') {
      seen({ username, movieId, watched: true }, (err, res) => {
        whichDidYouPrefer.call(this, { username, movieId }, (err, res) => {
          this.log(res)
        })
      }) 
    } else {
      seen({ username, movieId, watched: false }, (err, res) => {
        haveYouSeen.call(this, {username}, callback)   
      })
    }
  })
}

function makeQuestion (movie) {
  return Object.assign({}, question, {
    message: `Have you seen "${movie.title}" (${movie.year})?`,
    name: 'response'
  })
}
