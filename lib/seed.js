const db = require('../data')

module.exports = function (username, winnerId) {
  db('user_movies')
   .where({ username })
   .avg('elo')
   .asCallback((err, average) => {


   })




}
