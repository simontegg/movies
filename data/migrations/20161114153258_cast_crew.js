
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('cast_crew', (table) => {
    table.string('id').primary()
    table.string('job')
    table.string('name')
    table.integer('person_id')
    table.integer('movie_id')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('cast_crew') 
};
