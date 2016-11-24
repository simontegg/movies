const MovieDb = require('moviedb')(process.env.MOVIEDB_KEY)

module.exports = function (query, callback) {
  MovieDb.searchMovie({ query }, (err, response) => {
    callback(null, response.results)
  })
}
