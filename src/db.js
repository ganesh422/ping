var mysql      = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 10,	
  host     : 'localhost',
  user     : '********',
  password : '********',
  database : '********'
});

module.exports = pool;