const {
  LOGIN } = require('../constants')



module.exports = {
  login

}

function login (username, command) {
  return { 
    type: LOGIN,
    payload: { username, command }
  }
}

function seed (movieId) {


}

