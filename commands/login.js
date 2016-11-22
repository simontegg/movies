const upsert = require('../data/upsert')
const log = require('./log')
const { hello, noData } = require('../messages')

// pull-streams
const pull = require('pull-stream')
const values = require('pull-stream/sources/values')
const once = require('pull-stream/sources/once')
const drain = require('pull-stream/sinks/drain')
const onEnd = require('pull-stream/sinks/on-end')
const collect = require('pull-stream/sinks/collect')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const flatten = require('pull-stream/throughs/flatten')
const filter = require('pull-stream/throughs/filter')
const unique = require('pull-stream/throughs/unique')

module.exports = function (command, username) {
  log(command, hello(username))





}

    upsert('users', { username: currentuser }, (err, res) => {
      this.delimiter('>>')
      this.log(`hello ${currentuser}`)

      db('user_movies')
      .where('username', currentuser)
      .select()
      .ascallback((err, rows) => {
        if (rows.length === 0) {
          this.log("follow the prompts to seed the database with movies you might like") 
          favouritemovie.call(this, currentuser, cb)
        } else {
          cb()
        }
      })
