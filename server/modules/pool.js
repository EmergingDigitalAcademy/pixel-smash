const { Pool } = require('pg');

const pool = new Pool({
   host: 'localhost',
   database: 'pixel-smash',
   port: '5432',
})

pool.on('connect', () => console.log('connected to database...'));
pool.on('error', err => console.log(err));

module.exports = pool;