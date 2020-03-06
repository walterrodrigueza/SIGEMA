const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
//const MySQLStore = require('express-mysql-session')(session);
const MssqlStore = require('mssql-session-store')(session);
const bodyParser = require('body-parser');

const { database } = require('./keys');


const mssql = require('mssql') //prueba

// Intializations
const app = express();
require('./lib/passport');


// Settings
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

// Middlewares


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Se almacena la sesion en la web y no en el servidor
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true//,
  //cookie: { secure: true }
}));



app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());





// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
   

  // valida si el usuario es administrador
  try {
    if (global.usuario.id_Rol==1){
      // Pone que es administrador
      app.locals.administrador=true
    }else{
      app.locals.administrador=false
    }
  } catch (e) {
    // Pone que no es administrador
    app.locals.administrador=false
  }
  
  console.log('app.locals.administrador',app.locals.administrador)

  next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));
app.use('/BancoCentral', require('./routes/catalogos'));
app.use('/Tramas', require('./routes/Tramas'));
app.use('/Facturas', require('./routes/facturas'));
app.use('/Facturas2', require('./routes/facturas2'));

//app.use('/Tramas', require('./routes/Tramas'));


app.use('/usuarios_modifica', require('./routes/Usuarios/usuarios'));


// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting
app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
});
