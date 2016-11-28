const db = require('./index')

module.exports = getPair

function getPair ({username, movieAId}, callback) {
  db('user_movies')
  .where({ username, watched: true})
  .andWhereNot('movie_id', movieAId)
  .orderByRaw('RANDOM()')
  .limit(1)
  .select()
  .asCallback((err, rows) => {
    callback(err, getMovieid(rows))          
  })
}

function getMovieid (rows) {
  return rows[0] ? rows[0].movie_id : null
}

