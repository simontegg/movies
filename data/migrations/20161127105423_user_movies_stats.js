exports.up = function(knex, Promise) {  
  return Promise.all([
    knex.schema.table('user_movies', function(table){
      table.string('elo_90')
      table.string('elo_70')
    })
  ])
}

exports.down = function(knex, Promise) {  
  return Promise.all([
    knex.schema.table('user_movies', function(table){
      table.dropColumn('elo_90')
      table.dropColumn('elo_70')
    })
  ])
}
