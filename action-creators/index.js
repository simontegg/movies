

const {
  LOGIN } = require('../constants')


module.exports = {
  login

}

function login (username, command) {
  return [
    loginSetState(username, command),
    checkUser(username)
  ]
}

function loginSetState (username, command) {
  return { 
    type: LOGIN,
    payload: { username, command }
  }
}


function checkUser (username) {
  return (dispatch, getState) => {
    userMovieCount(username, (err, count) => {
      if (count === 0) dispatch(favouriteMovie())
      else dispatch(welcome()) 
    })
  }
  // if noData
    // log noData
  //  question favourite

}

function favouriteMovie () {
  return (dispatch, getState) => {
    const command = getState().command
    questions.favouriteMovie({command, username}, (answer) => {

    })
  }
}

function seed (movieId) {


}

