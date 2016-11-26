// action-creators
const prefer = require('./prefer')

// db
const seen = require('../data/seen')
const getRandomUnwatched = require('../data/get-random-unwatched')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')

// questions
const { seenMovie } = require('../questions')

module.exports = haveYouSeen
  
function haveYouSeen () {
  return (dispatch, getState) => {
    const { command, username, callback } = getState() 

    pull(
      once(username),
      asyncMap(getRandomUnwatched),
      asyncMap((movie, cb) => {
        command.prompt(seenMovie(movie), (answer) => {
          cb(null, { response: answer.response, movieId: movie.id })
        })
      }),
      map((res) => {
        const { response, movieId } = res
        const watched = (response === 'yes')
        return { username, movieId, watched } 
      }),
      asyncMap((update, cb) => {
        const { watched, movieId } = update

        seen(update, (err) => {
          if (err) {
            cb(err)
          } else if (watched) {
            cb(null, movieId)
          } else {
            cb(null, false)
            const next = require('./random-prompt')()
            dispatch(next())
          }
        })
      }),
      filter((movieId) => movieId),
      drain((movieAId) => {
        dispatch(prefer({ username, movieAId }, callback))
      })
    )
  }
}

