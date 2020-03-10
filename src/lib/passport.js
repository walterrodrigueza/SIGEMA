const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');



passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) => {
    //const rows = await pool.query("SELECT top 1 id,username,password,fullname FROM users WHERE username = '"+[username]+"'");
    //const rows = await pool.query("select 1 as id,id_usuario as username,password,Nombre as fullname,apellido1,apellido2,correo,estado from [dbo].[Usuarios] WHERE id_usuario = '"+[username]+"'");
    const rows = await pool.query("exec  [dbo].[SIGEMA_Usuario_Consulta] '" + [username] + "'");



    if (rows.recordsets.length > 0) {
        const user = rows.recordset[0];
        const validPassword = await helpers.matchPassword(password, user.password)


        if (validPassword) {

            global.usuarioGlobal = user;
            console.log('Variable Global Usuario', global.usuarioGlobal)

            done(null, user, req.flash('success', 'Bienvenido ' + global.usuarioGlobal.id_usuario));

        } else {
            done(null, false, req.flash('message', 'Incorrect Password'));
        }
    } else {
        return done(null, false, req.flash('message', 'The Username does not exists.'));
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'id_usuario',
    passwordField: 'contraseña',
    passReqToCallback: true
}, async(req, username, password, done) => {


    const { id_usuario, contraseña, nombre, primer_apellido, segundo_apellido, correo, tel_oficina, tel_celular, rol } = req.body;
    let newUser = {
        username,
        password
    };
    newUser.password = await helpers.encryptPassword(password);


    console.log("rol", rol, 2)

    //const result = await pool.query("EXECUTE [dbo].[prc_nuevo_usuario] '"+newUser.username+"','"+newUser.password+"','"+newUser.fullname+"'");



    try {

        const result = await pool.query("EXECUTE [dbo].[SIGEMA_Usuario_Crear] '" + global.usuarioGlobal.id_usuario + "','" + id_usuario + "','" + nombre + "','" + primer_apellido + "','" + segundo_apellido + "','" + correo + "','" + tel_oficina + "','" + tel_celular + "','" + rol + "','" + newUser.password + "','" + contraseña + "'");

        if (result.recordset[0].id == 0) {
            throw result.recordset[0].mensaje;
        } else {
            newUser.id = result.recordset[0].id;
            //newUser.id = 0; // TEMPORAL
            //return done(null, newUser); 
            return done(null, newUser, req.flash('success', result.recordset[0].mensaje));
        }
    } catch (e) {
        console.log(e);
        newUser.id = 0;
        return done(null, newUser, req.flash('message', e));
    }



}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    //const rows = await pool.query("SELECT * FROM users WHERE id = '"+[id]+"'");
    const rows = await pool.query("select top 1 * from [dbo].[Usuarios] ");
    done(null, rows);
});