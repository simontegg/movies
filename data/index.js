const Knex = require('knex')
module.exports = Knex(require('../knexfile')[process.env.NODE_ENV || 'development'])
