const express = require('express');
const router = express.Router();
const pool = require('../database');
const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');

// SIGNUP
router.get('/signup',async (req, res) => {

  // Consulta el maestro de la factura
  var query = await pool.query("SELECT [id_Rol],[Descripcion] FROM [SIGEMA].[dbo].[Roles] order by id_Rol asc");
  rol= query.recordset;
  
  console.log('query',query);

  res.render('auth/signup', {rol});
});

router.post('/signup', passport.authenticate('local.signup', {
  //successRedirect: '/profile',
  successRedirect: '/signup',
  failureRedirect: '/signup',
  failureFlash: true
}));

// // usuario modifica
// router.get('/modifica',async (req, res) => {
//   // Consulta el usuario
//   var query = await pool.query("exec  [dbo].[SIGEMA_Usuario_Consulta] 'warodr1'");
//   usuario= query.recordset[0];
//   res.render('auth/modifica', {usuario});
  
// });

router.post('/signup', passport.authenticate('local.signup', {
  //successRedirect: '/profile',
  successRedirect: '/signup',
  failureRedirect: '/signup',
  failureFlash: true
}));


// SINGIN
router.get('/signin', (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
  req.check('username', 'El usuario es requerido').notEmpty();
  req.check('password', 'La contraseña es requerida').notEmpty();
  
  const errors = req.validationErrors();
  
  
  if (errors.length > 0) {
    req.flash('message', errors[0].msg);
    res.redirect('/signin');
  }

  passport.authenticate('local.signin', {    
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});

module.exports = router;
