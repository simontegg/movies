const question = {
  type: 'confirm',
  name: 'seed',
  message: 'Seed movie database?',
  default: true
}

const promptToSeed = (user) => {
  this.prompt(question, (answer) => {
    if (answer.seed) {
      
    }

  })
  


}




module.exports = promptToSeed
