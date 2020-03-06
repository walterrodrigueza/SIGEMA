const express = require('express');
const router = express.Router();

const pool = require('../../database');
const { isLoggedIn } = require('../../lib/auth');

const swal = require('body-parser'); //libreria para mensajes en pantalla

const Swal = require('sweetalert2')



// usuario modifica
router.get('/',isLoggedIn,async (req, res) => {
  
    // Consulta el usuario

    var query = await pool.query("exec  [dbo].[SIGEMA_Usuario_Consulta] '"+global.usuario.id_usuario+"'");
    usuario= query.recordset[0];
    // Indica que no hay mensaje de creacion de nuevo registro
    usuario.mensaje_titulo='0'
    usuario.mensaje_detalle='0'

    res.render('usuarios/usuarios_modifica', {usuario});

  });


  router.post('/', isLoggedIn,async (req, res) => {

    //Obtine el número de control indicado por el usuario
    const { id_usuario,contraseña,nombre,primer_apellido,segundo_apellido,correo,tel_oficina,tel_celular,rol} = req.body;
     
    // Almacena los valores del nuevo usuario para enviarlos a publicar
    usuario.Nombre=nombre
    usuario.Apellido1=primer_apellido
    usuario.Apellido2=segundo_apellido
    usuario.Correo=correo    
    usuario.Tel_Oficina=tel_oficina
    usuario.Tel_Celular=tel_celular
    

    const result = await pool.query("exec [dbo].[SIGEMA_Usuario_Modificar] '"+global.usuario.id_usuario+"','"+nombre+"','"+primer_apellido+"','"+segundo_apellido+"','"+correo+"',"+tel_oficina+","+tel_celular);

    usuario.mensaje_titulo='Registro actualizado!'
    usuario.mensaje_detalle='El usuario '+usuario.id_usuario+' fue actualizado'

    // espera unos segundos para que se vea el mensaje en pantalla
    //await timeout(3000);

     // redirecciona a la misma página
     res.render('usuarios/usuarios_modifica',{usuario});    

 });


 function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

  
  module.exports = router;