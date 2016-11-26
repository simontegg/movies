const db = require('../data')
const elo = require('elo-rank')()

const { ELO_INITIAL } = require('../constants')

module.exports = function (username, winnerId, loserId, callback) {
  db('user_movies') 
    .whereIn('movie_id', [winnerId, loserId])
    .andWhere({ username })
    .select()
    .asCallback((err, movies) => {
      updateMatchResults(
        updateRatings(
          [getMovie(winnerId, movies), getMovie(loserId, movies)], 
          eloRatings(
            getMovie(winnerId, movies).elo, 
            getMovie(loserId, movies).elo
          )
        ), 
        (err) => callback(null, winnerId)
      )
    })
}

function updateRatings (movies, ratings) {
  return movies.map((movie, i) => {
    movie.elo = ratings[i]
    return movie
  })
}

function updateMatchResults (updates, callback) {
  let doneCount = 0
  
  function done (err, res) {
    if (err) callback(err)
    doneCount ++
    if (doneCount === 3) callback(null, updates)
  }

  updates.forEach(({username, movie_id, elo}) => {
    db('user_movies')
      .where({ username, movie_id })
      .update('elo', elo)
      .asCallback(done)
  })

  db('movies_elo')
    .insert({ 
      username: updates[0].username,
      movie_a: updates[0].movie_id,
      movie_b: updates[1].movie_id,
      winner: updates[0].movie_id
    })
    .asCallback(done)
}

function getMovie (id, movies) {
  return movies.find((movie) => movie.movie_id === id)
}

function eloRatings (winner, loser) {
  const winnerElo = winner || ELO_INITIAL
  const loserElo = loser || ELO_INITIAL // default params ?

  const expectedWinner = elo.getExpected(winnerElo, loserElo)
  const expectedLoser = elo.getExpected(loserElo, winnerElo)

  return [
    elo.updateRating(expectedWinner, 1, winnerElo),
    elo.updateRating(expectedLoser, 0, loserElo)
  ]
}
