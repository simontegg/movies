const upsert = require('./upsert')
  
module.exports = function ({username, movieId, watched}, callback) {
  upsert(
    'user_movies', 
    { username, movie_id: movieId }, 
    { watched }, 
    (err) => {
      if (err) callback(err)
      else callback(null, { username, movieId, watched })
    }
  )
}
