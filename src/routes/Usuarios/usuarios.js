const express = require('express');
const router = express.Router();

const pool = require('../../database');
const { isLoggedIn } = require('../../lib/auth');

const swal = require('body-parser'); //libreria para mensajes en pantalla

const Swal = require('sweetalert2')
const helpers = require('../../lib/helpers'); // para validar los password

var mensaje = []; // variable para guardar mensajes


// usuario modifica
router.get('/Modifica', isLoggedIn, async(req, res) => {

    // Consulta el usuario

    var query = await pool.query("exec  [dbo].[SIGEMA_Usuario_Consulta] '" + global.usuarioGlobal.id_usuario + "'");
    usuario = query.recordset[0];
    // Indica que no hay mensaje de creacion de nuevo registro

    mensaje.titulo = '0'
    mensaje.detalle = '0'

    res.render('usuarios/Modifica', { usuario, mensaje });

});


router.post('/Modifica', isLoggedIn, async(req, res) => {

    //Obtine el número de control indicado por el usuario
    const { id_usuario, contraseña, nombre, primer_apellido, segundo_apellido, correo, tel_oficina, tel_celular, rol } = req.body;

    // Almacena los valores del nuevo usuario para enviarlos a publicar
    usuario.Nombre = nombre
    usuario.Apellido1 = primer_apellido
    usuario.Apellido2 = segundo_apellido
    usuario.Correo = correo
    usuario.Tel_Oficina = tel_oficina
    usuario.Tel_Celular = tel_celular


    const result = await pool.query("exec [dbo].[SIGEMA_Usuario_Modificar] '" + global.usuarioGlobal.id_usuario + "','" + nombre + "','" + primer_apellido + "','" + segundo_apellido + "','" + correo + "'," + tel_oficina + "," + tel_celular);

    mensaje.titulo = 'Registro actualizado!'
    mensaje.detalle = 'El usuario ' + usuario.id_usuario + ' fue actualizado'
    mensaje.type = 'success'

    // espera unos segundos para que se vea el mensaje en pantalla
    //await timeout(3000);

    // redirecciona a la misma página
    res.render('usuarios/Modifica', { usuario, mensaje });

});


// usuario modifica
router.get('/CambiaPassword', isLoggedIn, async(req, res) => {

    // Consulta el usuario

    var query = await pool.query("exec  [dbo].[SIGEMA_Usuario_Consulta] '" + global.usuarioGlobal.id_usuario + "'");
    usuario = query.recordset[0];
    // Indica que no hay mensaje de creacion de nuevo registro

    mensaje.titulo = '0'
    mensaje.detalle = '0'

    res.render('usuarios/CambiaPassword', { usuario, mensaje });

});


router.post('/CambiaPassword', isLoggedIn, async(req, res) => {

    //Obtine el número de control indicado por el usuario
    const { id_usuario, pass_anterior, pass_nuevo, pass_repite } = req.body;


    // Valida si el password anterior es correcto
    const validPassword = await helpers.matchPassword(pass_anterior, global.usuarioGlobal.password)


    if (validPassword) {
        mensaje.titulo = 'Password cambiado!'
        mensaje.detalle = 'El password del usuario ' + usuario.id_usuario + ' fue actualizado correctamente'
        mensaje.type = 'success'
    }


    if (pass_nuevo != pass_repite) {
        mensaje.titulo = 'Verificar el nuevo password'
        mensaje.detalle = 'La verificación del nuevo password no fue correcta'
        mensaje.type = 'error'
    }

    if (!validPassword) {
        mensaje.titulo = 'Password incorrecto!'
        mensaje.detalle = 'El password del usuario ' + usuario.id_usuario + ' no es el correcto'
        mensaje.type = 'error'
    }

    console.log(usuario.id_usuario, global.usuarioGlobal.password, await helpers.encryptPassword(pass_nuevo), pass_nuevo);

    Nuevo_Password_encriptado = await helpers.encryptPassword(pass_nuevo)

    // Cambia la contraseña del usuario -- id_usuario, password_anterior, password_nuevo, password_nuevo_original
    const rows = await pool.query("exec [dbo].[SIGEMA_Usuario_Password_Cambiar] '" + usuario.id_usuario + "','" + global.usuarioGlobal.password + "','" + Nuevo_Password_encriptado + "','" + pass_nuevo + "'");

    // Asigna la nueva contraseña a la contraseña global
    global.usuarioGlobal.password = Nuevo_Password_encriptado;


    // redirecciona a la misma página
    res.render('usuarios/CambiaPassword', { usuario, mensaje });

});


// usuario Administar
router.get('/Administrar', isLoggedIn, async(req, res) => {
    // Consulta todos los usuarios
    var query2 = await pool.query("SELECT id_usuario,Nombre,Apellido1,Apellido2,Correo,Tel_Oficina,Tel_Celular,estado,Fecha_Creacion  FROM SIGEMA.dbo.Usuarios order by id_usuario asc");

    usuarios = query2.recordset;
    console.log(usuarios)

    // Consulta el usuario

    var query = await pool.query("exec  [dbo].[SIGEMA_Usuario_Consulta] '" + global.usuarioGlobal.id_usuario + "'");
    usuario = query.recordset[0];
    // Indica que no hay mensaje de creacion de nuevo registro
    mensaje.titulo = '0'
    mensaje.detalle = '0'

    res.render('usuarios/Administrar', { usuario, usuarios, mensaje });

});

// usuario Administar usuario
router.get('/Administrar/:seleccion', isLoggedIn, async(req, res) => {
    const { seleccion } = req.params;

    var query = await pool.query("SELECT id_usuario,Nombre,Apellido1,Apellido2,Correo,Tel_Oficina,Tel_Celular,estado,Fecha_Creacion  FROM SIGEMA.dbo.Usuarios where id_usuario='" + seleccion + "'");
    usuario = query.recordset[0];

    query = await pool.query("select id_Rol,Descripcion from roles");
    roles = query.recordset;
    console.log(roles)

    // Trae los roles con que cuenta el usuario
    query = await pool.query("SELECT a.id_Rol as id_Rol,b.Descripcion as Descripcion FROM UsuariosXRoles A, Roles B where a.id_Rol=b.id_Rol and idusuario='" + seleccion + "'");
    roles_usuario = query.recordset;
    console.log(roles_usuario)

    // Indica que no hay mensaje de creacion de nuevo registro
    mensaje.titulo = '0'
    mensaje.detalle = '0'

    res.render('usuarios/AdministraUsuario', { usuario, mensaje, roles, roles_usuario });

});

router.post('/Administrar', isLoggedIn, async(req, res) => {

    //Obtine el número de control indicado por el usuario
    const { id_usuario, pass_anterior, pass_nuevo, pass_repite } = req.body;

    console.log('entro a post administar', req.body)

    // redirecciona a la misma página
    res.render('usuarios/AdministraUsuario', { usuario, mensaje, roles });

});

router.post('/Administrar_agrega_rol', isLoggedIn, async(req, res) => {

    //Obtine el número de control indicado por el usuario
    const { rol } = req.body;

    if (rol != undefined) {
        // Crea el nuevo rol
        query = await pool.query("Exec [dbo].[SIGEMA_Usuario_Rol_Asignar] '" + global.usuarioGlobal.id_usuario + "','" + usuario.id_usuario + "'," + rol);

        // Trae los nuevos roles del usuario
        query = await pool.query("SELECT a.id_Rol as id_Rol,b.Descripcion as Descripcion FROM UsuariosXRoles A, Roles B where a.id_Rol=b.id_Rol and idusuario='" + usuario.id_usuario + "'");
        roles_usuario = query.recordset;
    }

    // redirecciona a la misma página    
    res.render('usuarios/AdministraUsuario', { usuario, mensaje, roles, roles_usuario });

});

router.post('/Administrar_quita_rol', isLoggedIn, async(req, res) => {

    //Obtine el número de control indicado por el usuario
    const { rol2 } = req.body;

    if (rol2 != undefined) {
        // quita el rol
        query = await pool.query("Exec [dbo].[SIGEMA_Usuario_Rol_Quitar] '" + global.usuarioGlobal.id_usuario + "','" + usuario.id_usuario + "'," + rol2);

        // Trae los nuevos roles del usuario
        query = await pool.query("SELECT a.id_Rol as id_Rol,b.Descripcion as Descripcion FROM UsuariosXRoles A, Roles B where a.id_Rol=b.id_Rol and idusuario='" + usuario.id_usuario + "'");
        roles_usuario = query.recordset;
    }


    // redirecciona a la misma página
    res.render('usuarios/AdministraUsuario', { usuario, mensaje, roles, roles_usuario });

});


router.post('/Administrar_modifica_usuario', isLoggedIn, async(req, res) => {

    //Obtine el número de control indicado por el usuario
    const { id_usuario, contraseña, nombre, primer_apellido, segundo_apellido, correo, tel_oficina, tel_celular, rol } = req.body;

    console.log(req.body)
        // Almacena los valores del nuevo usuario para enviarlos a publicar
    usuario.id_usuario = id_usuario
    usuario.Nombre = nombre
    usuario.Apellido1 = primer_apellido
    usuario.Apellido2 = segundo_apellido
    usuario.Correo = correo
    usuario.Tel_Oficina = tel_oficina
    usuario.Tel_Celular = tel_celular

    console.log("exec [dbo].[SIGEMA_Usuario_Modificar] '" + id_usuario + "','" + nombre + "','" + primer_apellido + "','" + segundo_apellido + "','" + correo + "'," + tel_oficina + "," + tel_celular)

    const result = await pool.query("exec [dbo].[SIGEMA_Usuario_Modificar] '" + id_usuario + "','" + nombre + "','" + primer_apellido + "','" + segundo_apellido + "','" + correo + "'," + tel_oficina + "," + tel_celular);

    mensaje.titulo = 'Registro actualizado!'
    mensaje.detalle = 'El usuario ' + usuario.id_usuario + ' fue actualizado'
    mensaje.type = 'success'

    // redirecciona a la misma página
    res.render('usuarios/AdministraUsuario', { usuario, mensaje, roles, roles_usuario });

});



function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = router;