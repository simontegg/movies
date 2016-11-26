
module.exports = function getLoserId (movies, winnerId) {
  return movies.filter((movie) => movie.id !== winnerId)[0].id
}
