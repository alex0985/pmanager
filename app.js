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