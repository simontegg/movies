const dotenv = require('dotenv')
dotenv.load()

const vorpal = require('vorpal')()
const store = require('./store')

const toPairs = require('lodash.topairs')

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

vorpal
  .command('login <username>', 'identifies user')
  .action(function (args, cb) {
    currentUser = args.username
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
  .delimiter('type "login [username]" to get started: ')
  .show()
  .parse(process.argv)



