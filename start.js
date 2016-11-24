const dotenv = require('dotenv')
dotenv.load()

const vorpal = require('vorpal')()
const { getState, subscribe, dispatch } = require('./store')
const { login } = require('./action-creators')

const toPairs = require('lodash.topairs')


subscribe(() => {
  console.log(getState())
})

vorpal
  .command('login <username>', 'identifies user')
  .action(function (args, cb) {
    dispatch(login(args.username, this))

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

