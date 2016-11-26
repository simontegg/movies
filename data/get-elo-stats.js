const db = require('../data')

module.exports = function (username, callback) {
  db('user_movies')
    .where({ username })
    .max('elo as eloMax')
    .count('elo as eloCount')
    .asCallback((err, res) => {
      if (err) cb (err)
      console.log(res) 
      callback(null, res[0])
    })
}
