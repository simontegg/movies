const { ELO_INITIAL } = require('../constants')

const db = require('../data')

module.exports = function (username, movie_id, callback) {
  db('user_movies')
    .where({ username })
    .max('elo as elo_max')
    .select()
    .asCallback((err, res) => {
      console.log(res) 
      callback(null, false)
    })



    })






}
