const db = require('../data')

module.exports = function (username, winner) {
  db('user_movies')
    .where({ username })
    .avg('elo as average')
    .max('elo as max')
  //  .where('movie_id', winnerId)
  //  .andWhere('elo', '>', 'average')
  //  .select()
    .asCallback((err, result) => {

      console.log('seed', result, winner)

   })




}
