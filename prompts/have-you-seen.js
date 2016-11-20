const getRandomUnwatched = require('../lib/get-random-unwatched')

const question = {
  type: 'list',
  choices: ['yes', 'no']
}

module.exports = function (username, callback) {
  console.log('haveYouSeen', username)
  getRandomUnwatched(username, (err, movies) => {
    const movie = movies[0]
    if (err) {
      callback(err)
    } else {
      question.message = `Have you seen "${movie.title}" - ${movie.year}? -
      http://www.imdb.com/${movie.imdb_id}`
      question.name = movie.id
      callback(null, question)
    }
  })
}
