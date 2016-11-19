
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('users', (table) => {
    table.increments('id').primary()
    table.string('username').unique()
    table.string('password_hash')
    table.integer('phone')
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users') 
};
