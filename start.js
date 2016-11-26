const dotenv = require('dotenv')
dotenv.load()

const vorpal = require('vorpal')()
const { getState, subscribe, dispatch } = require('./store')
const { login, haveYouSeen } = require('./action-creators')

const toPairs = require('lodash.topairs')

let messageRef

subscribe(() => {
  const { message, command } = getState() 

  if (message !== messageRef) {
    command.log(message)
    messageRef = message
  }
})

vorpal
  .command('login <username>', 'identifies user')
  .action(function (args, done) {
    dispatch(login(this, args.username, done))
  })

vorpal
  .command('learn', 'movie-bot learns the movies you like')
  .action(function (args, callback) {
    dispatch(haveYouSeen(getState().username, callback))
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

