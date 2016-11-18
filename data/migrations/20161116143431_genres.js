
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('genres', (table) => {
    table.string('movie_id')
    table.string('genre')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('genres') 
};
