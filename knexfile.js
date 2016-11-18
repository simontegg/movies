// Update with your config settings.
const path = require('path')

const PATHS = {
  development: path.join(__dirname, '/data/dev.sqlite3'),
  test: path.join(__dirname, '/data/test.sqlite3'),
  production: path.join(__dirname, '/data/seek.sqlite3'),
  migrations: path.join(__dirname, '/data/migrations'),
  seeds: path.join(__dirname, '/data/seeds')
}

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: PATHS.development
    },
    migrations: {
      directory: PATHS.migrations,
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: PATHS.seeds
    },
    useNullAsDefault: true
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: PATHS.test
    },
    migrations: {
      directory: PATHS.migrations,
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: PATHS.seeds
    },
    useNullAsDefault: true
  },

  // pushing dev database to production
  production: {
    client: 'sqlite3',
    connection: {
      filename: PATHS.development
    },
    migrations: {
      directory: PATHS.migrations,
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: PATHS.seeds
    },
    useNullAsDefault: true
  }
}
