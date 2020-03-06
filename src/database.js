const mssql = require('mssql')
const { promisify }= require('util');

const { database } = require('./keys');



//BD_TERCEROS

const pool = new mssql.ConnectionPool(database);


pool.connect((err, connection) => {
  if (err) {
    console.error('Problemas de conexión');
  }
  console.error('Conexión establecida');
  
});

// Promisify Pool Querys
pool.query = promisify(pool.query);



module.exports = pool;


