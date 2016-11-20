const db = require('../data')
const haveYouSeen = require('./have-you-seen')

module.exports = whichDidYouPrefer

function whichDidYouPrefer ({username, movieId}, callback) {
  if (movieId) {
    db('user_movies')
      .where({ username, watched: true })
      .andWhereNot('movie_id', movieId) 
      .select()
      .asCallback((err, rows) => {
        console.log(rows, username, movieId)
        callback(err, rows)          
      })

  } else {
    db('user_movies')
      .where({ username, watched: true })
  }



}
