const shuffle = require('lodash.shuffle')
const haveYouSeen = require('./have-you-seen')
const prefer = require('./prefer')

// avoid cicular dependency
// http://stackoverflow.com/a/10872988
module.exports = function () {  
  return shuffle([haveYouSeen, prefer])[0]
}

