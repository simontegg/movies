const dotenv = require('dotenv')
dotenv.load()

const vorpal = require('vorpal')()
const { getState, subscribe, dispatch } = require('./store')
const { 
  login, 
  haveYouSeen,
  predict } = require('./action-creators')

const toPairs = require('lodash.topairs')

let messageRef

subscribe(() => {
  const { message, command, seeding } = getState() 
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
  .command('predict', 'movie-bot tries to predict movies that you will like but have not seen')
  .action(function (args, callback) {

    dispatch(predict())

  })

vorpal
  .command('search <title>', 'searches for a movie')
  .action(function (args, cb) {
    searchMovie(args.title, (err, results) => {
      this.prompt(confirmMovie(results), (result) => {
        this.log('seeding database...')
        seedFromMovie(result.movieId, cb) 
      })
    })
  })

vorpal
  .delimiter('>>')
  .show()
  .parse(process.argv)

