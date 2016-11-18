const dotenv = require('dotenv')
dotenv.load()
const MovieDb = require('moviedb')(process.env.MOVIEDB_KEY)





// pull-streams
const pull = require('pull-stream')
const values = require('pull-stream/sources/values')
const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
const unique = require('pull-stream/throughs/unique')

const db = require('./data')
const filterCastCrew = require('./lib/filter-cast-crew')
const filmography = require('./filmography')
const rating = require('./rating')
const moviePeople = require('./movie-people')
const insertCredit = require('./insert-credit')
const mapToCredit = require('./lib/map-to-credit')

let movieId
let movieTitle = 'Dodgeball'

pull(
  values([movieTitle]),
  asyncMap((q, cb) => {
    MovieDb.searchMovie({ query: q }, cb)
  }),
  map((response) => response.results[0].id),
  asyncMap((id, cb) => {
    movieId = id
    console.log('movieId', movieId)
    rating(movieId)
    MovieDb.movieCredits({ id }, cb)
  }),
  map((res) => res.cast.concat(res.crew)),
  flatten(),
  filter(filterCastCrew),
  asyncMap((credit, cb) => {
    db('cast_crew')
    .where('id', credit.credit_id)
    .select()
    .asCallback((err, rows)  => {
      if (rows.length === 0) cb(null, credit)
        else cb(null, false)
    })
  }),
  filter((credit) => credit),
  unique((credit) => {
    const row = mapToCredit(movieId, credit)
    return `${row.job}-${row.person_id}-${row.movie_id}` 
  }),
  asyncMap((credit, cb) => {
    db('cast_crew')
    .insert(mapToCredit(movieId, credit))
    .asCallback(cb)
  }),
  onEnd(() => moviePeople(movieId))
)


function filterMovies (media) {
  return media.media_type === 'movie'
  && [
    'himself', 
    'Himself', 
    'herself', 
    'Herself', 
    ''].indexOf(media.character) === -1
}
