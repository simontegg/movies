const dotenv = require('dotenv')
dotenv.load()

const vorpal = require('vorpal')()
const toPairs = require('lodash.topairs')


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

// commands 
const searchMovie = require('./commands/search-movie')
const confirmMovie = require('./commands/confirm-movie')
const seedFromMovie = require('./commands/seed-from-movie')
const upsert = require('./lib/upsert')
const favouriteMovie = require('./prompts/favourite-movie')
const haveYouSeen = require('./prompts/have-you-seen')

const db = require('./data')
const seen = require('./lib/seen')

let currentUser


const login = {
  type: 'input',
  name: 'username',
  message: 'Login with a username: '
} 

vorpal
  .command('start', 'identifies user')
  .action(function (args, cb) {
    this.prompt(login, (answer) => {
      currentUser = answer.username
      upsert('users', { username: currentUser }, (err, res) => {
        this.delimiter('>>')
        this.log(`Hello ${currentUser}`)

        db('user_movies')
          .where('username', currentUser)
          .select()
          .asCallback((err, rows) => {
            if (rows.length === 0) {
              this.log("follow the prompts to seed the database with movies you might like") 
              favouriteMovie.call(this, currentUser, cb)
            } else {
              cb()
            }
          })
      })
    })
  })

vorpal
  .command('learn', 'movie-bot learns the movies you like')
  .action(function (args, cb) {
    console.log(currentUser, cb)
    haveYouSeen.call(this, {username: currentUser}, cb)
  })

vorpal
  .command('search <title>', 'searches for a movie')
  .action(function (args, cb) {
    searchMovie(args.title, (err, results) => {
      this.prompt(confirmMovie(results), (result) => {
        this.log('seeding database...', result)
        seedFromMovie(result.movieId, cb) 
      })
    })
  })

vorpal
  .delimiter('type "start" to get started: ')
  .show()
  .parse(process.argv)



