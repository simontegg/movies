exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('movies', (table) => {
    table.integer('id').primary()
    table.string('imdb_id')
    table.string('title')
    table.string('image')
    table.integer('runtime')
    table.integer('year')
    table.string('rated')
    table.string('country')
    table.integer('metascore')
    table.float('imdb_rating')
    table.integer('tomato_meter')
    table.boolean('tomato_fresh')
    table.float('tomato_rating')
    table.integer('tomato_user_meter')
    table.float('tomato_user_rating')
    table.integer('boxoffice')
    table.string('production')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('movies') 
};
