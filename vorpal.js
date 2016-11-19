const dotenv = require('dotenv')
dotenv.load()



const vorpal = require('vorpal')()


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


const db = require('./data')


vorpal
  .command('search <title>', 'searches for a movie')
  .action(function (args, cb) {
    searchMovie(args.title, (err, results) => {
      this.prompt(confirmMovie(results), (result) => {
        this.log(result) 
        cb()
      })
    })
  })

vorpal
  .delimiter('movie-bot:')
  .show()
  .parse(process.argv);
