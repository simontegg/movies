
const prefer = {
  type: 'list',
  name: 'winner',
  message: 'Which did you prefer?'
}

const favourite = {
  type: 'input',
  name: 'query',
  message: 'Enter the title of a favourite movie: ',
}

const seen = {
  type: 'list',
  choices: ['yes', 'no']
}

const predictQ = {
  type: 'checkbox',
}

function predictions (predictedMovies) {
  return {
    message: 'Select the movies you have seen already',
    type: 'checkbox',
    choices: predictedMovies.map(makeChoice)
  }
}

function confirmMovie (results) {
  const choices = results.map((result) => ({
    name: `${result.title} ${result.release_date.slice(0, 4)}`,
    value: result.id
  }))

  return {
    type: 'list',
    name: 'movieId',
    choices,
    message: 'Confirm your movie: '
  }
}

function seenMovie (movie) {
  return Object.assign({}, seen, {
    message: `Have you seen "${movie.title}" (${movie.year})?`,
    name: 'response'
  })
}

function preferQuestion (movies) {
  return Object.assign({}, prefer, { choices: movies.map(makeChoice) })
}

function makeChoice (movie) {
  return { name: `${movie.title} (${movie.year})`, value: movie.id }
}

module.exports = {
  favourite,
  confirmMovie,
  seenMovie,
  preferQuestion
}
