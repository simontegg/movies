module.exports = function (results) {
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
