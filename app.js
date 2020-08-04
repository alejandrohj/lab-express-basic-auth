require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// require database configuration
require('./configs/db.config');

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

//sessions
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

app.use(session({
    secret: 'zeus',
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000 //1 day//Miliseconds
    },
    store: new MongoStore({ 
      mongooseConnection: mongoose.connection,
      ttl: 1 * 24 * 60 * 60 //1 day //Seconds
    })
}));

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

const index = require('./routes/index.routes');
app.use('/', index);
const auth = require('./routes/auth.routes');
app.use('/', auth);

app.use((req, res, next) => {
  if (req.session.loggedInUser) { // <== if there's user in the session (user is logged in)
    next(); // ==> go to the next route ---
  } else {                          //    |
    res.redirect("/signin");         //    |
  }                                 //    |
}); // ------------------------------------                                
//     | 
//     V
const private = require('./routes/private.routes');
app.use('/', private);



module.exports = app;
