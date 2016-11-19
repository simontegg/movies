module.exports = function (results) {
  const choices = results.map((result) => ({
    name: `${result.title} ${result.release_date}`,
    id: result.id
  }))

  return {
    type: 'list',
    name: 'select-movie',
    choices,
    message: 'Confirm your movie: '
  }
}
