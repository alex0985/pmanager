var mysql = require('mysql');
var dbcon = require('./b-db-connection');

var connection = mysql.createConnection(dbcon);
connection.connect();

module.exports = connection;