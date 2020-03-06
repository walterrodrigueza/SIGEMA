const mssql = require('mssql')
const { promisify }= require('util');

const { database } = require('./keys');


//BDSILOV3
var database_BDSILOV3 = {
  user: 'silo',
  password: 'silo123',
  server: '10.135.47.23',
  port : 1433,
  database: 'BDSILOV3'
};

const pool_BDSILOV3 = new mssql.ConnectionPool(database_BDSILOV3);

pool_BDSILOV3.connect((err, connection) => {
  if (err) {
    console.error('Problemas de conexión');
  }
  console.error('Conexión establecida');  
});

// Promisify Pool Querys
pool_BDSILOV3.query = promisify(pool_BDSILOV3.query);

module.exports = pool_BDSILOV3;



