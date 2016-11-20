exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('movies_elo', (table) => {
    table.string('username')
    table.integer('movie_a')
    table.integer('movie_b')
    table.string('winner')
    
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('movies_elo') 
};
