

const favourite = {
  type: 'input',
  name: 'query',
  message: 'Enter the title of a favourite movie: ',
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

module.exports = {
  favourite,
  confirmMovie
}
