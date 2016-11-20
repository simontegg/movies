exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('user_movies', (table) => {
    table.string('username')
    table.integer('movie_id')
    table.boolean('watched')
    table.boolean('favourite')
    table.float('rating')
    table.integer('elo')
    
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user_movies') 
};
