
const hello = (username) => `Hello ${username}`
const noData = "I'm going to ask you some questions to find out what kind of movies you like"


module.exports = {
  hello,
  noData,
  yourPredictions
}

function yourPredictions (movies) {
  return `Movie Bot predicts that you will like the following movies: \n
  ${movies.map(formatMovie)}`
}

function formatMovie (movie) {
  return `${movie.title} (${movie.year}) - ${movie.genres.map(formatGenre)} \n`
}

function formatGenre (genre) {
  return `${genre} `
}





