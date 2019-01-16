//variables
var port = process.env.port || 8090;

//Modules
var path = require('path');
var express = require('express');
var cors = require('cors'); //Allow Cross Origin
var morgan = require('morgan'); //Log all server requests
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var flash = require('connect-flash');
require('dotenv').config();

//Refer loaded modules
require('./app/config/passport')(passport);

var app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');

//Save Session in DB
var dbcon = require('./app/config/b-db-connection');
// Whether or not to automatically check for and clear expired sessions:
dbcon.clearExpired = true;
// How frequently expired sessions will be cleared; milliseconds:
dbcon.checkExpirationInterval = 300000;
// The maximum age of a valid session; milliseconds:
dbcon.expiration = 900000;
// Whether or not to end the database connection when the store is closed.
// The default value of this option depends on whether or not a connection was passed to the constructor.
// If a connection object is passed to the constructor, the default value for this option is false.
dbcon.endConnectionOnClose = true;
dbcon.charset = 'utf8mb4_bin';
dbcon.schema = {
    tableName: 'sessions',
    columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
    }
};

var sessionStore = new MySQLStore(dbcon);
app.use(session({
    secret: 'u390182z3ghbodfa8231',
    resave: false,
    store: sessionStore,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes/login.js')(app, passport, __dirname);
require('./app/routes/bdb.js')(app, passport);

app.listen(port, function () {
    console.log('Server running on port ' + port);
});