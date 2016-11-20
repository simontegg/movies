const shuffle = require('lodash.shuffle')
const haveYouSeen = require('./have-you-seen')
const whichDidYouPrefer = require('./which-did-you-prefer')

module.exports = function () {
  return shuffle([haveYouSeen, whichDidYouPrefer])[0]
}
