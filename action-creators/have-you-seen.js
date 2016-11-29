// db
const seen = require('../data/seen')

// pull-streams
const pull = require('pull-stream')
const once = require('pull-stream/sources/once')
const onEnd = require('pull-stream/sinks/on-end')
const drain = require('pull-stream/sinks/drain')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')

// questions
const { seenMovie } = require('../questions')

module.exports = haveYouSeen
  
function haveYouSeen (movie, callback) {
  return (dispatch, getState) => {
    const { command, username } = getState() 

    pull(
      once(movie),
      asyncMap((movie, cb) => {
        console.log({movie})
        command.prompt(seenMovie(movie), ({response}) => {
          cb(null, mapResponseToUpdate(username, response, movie.id))
        })
      }),
      asyncMap((update, cb) => {
        const { watched, movieId } = update

        seen(update, (err) => {
          if (err) cb(err)
          else cb(null, update)
        })
      }),
      drain((update) => {
        callback(null, update)
      })
    )
  }
}

function mapResponseToUpdate (username, response, movieId) {
  return {
    username,
    movieId,
    watched: (response === 'yes')
  }
}

