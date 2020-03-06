const express = require('express');
const router = express.Router();

const pool_BDSILOV3 = require('../database_SILO');
const { isLoggedIn } = require('../lib/auth');

const swal = require('body-parser'); //libreria para mensajes en pantalla

//var clientsData = require('/js/clients.json');
//var Datastore = require('nedb');
//var db = new Datastore();
//db.insert(clientsData);

router.get('/', isLoggedIn, async (req, res) => {
    const query = await pool_BDSILOV3.query("select top 5 NumFactura as Name FROM [SILO].[dbo].[Facturacion_Operadores_Mensual]");

    //const { id, usuario } = req.body;
    
    //console.log(req.body);
    //console.log(id);
    //console.log(usuario);

    facturas=query;
    facturas= query.recordset;


    var myObj = [{ "Name":"John", "age":30, "car":10 },{ "Name":"John", "age":30, "car":10 }];
    facturas=myObj

    
    res.render('Facturas/Factura2', { facturas });
});


router.get('/listar', isLoggedIn, async (req, res) => {
    const query = await pool_BDSILOV3.query("select top 100 NumFactura as Factura,AñoCobro as Año,MesCobro as Mes,idoperador as Operador,TotalPagar as Total,SUBSTRING(clave_fisco,22,20) as clave_fisco FROM [SILO].[dbo].[Facturacion_Operadores_Mensual] order by AñoCobro desc,SUBSTRING(NumFactura,4,4) desc");


    facturas=query;
    facturas= query.recordset;

    console.log(facturas);
    console.log('2x');
    
    var myObj = [{ "Name":"Johna", "age":30, "car":10 },{ "Name":"John", "age":30, "car":10 }];
    //facturas=myObj

    console.log(facturas);
    
    res.json(facturas);
});


router.post('/', function(req, res, next) {
    //db.find(getClientFilter(req.query), function(err, items) {
    //    res.json(items);
    //});
    var query2 = pool_BDSILOV3.query("select top 5 NumFactura as Name FROM [SILO].[dbo].[Facturacion_Operadores_Mensual]");

    var myObj = [{ "Name":"John", "age":30, "car":10 },{ "Name":"John", "age":30, "car":10 }];
    query2 = myObj.name;

    console.log('b1');  
    console.log(myObj);
    console.log('b2');  
    res.json(myObj);
});

module.exports = router;

