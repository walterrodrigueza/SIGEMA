const express = require('express');
const router = express.Router();

const pool_BDSILOV3 = require('../database_SILO');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('links/add');
});

router.post('/add', async (req, res) => {
    const { title, url, description } = req.body;
    const newLink = {
        title,
        url,
        description,
        user_id: req.user.recordset[0].id
    };
    
    
    await pool_BDSILOV3.query("INSERT INTO [dbo].[links] ([title],[url],[description],[user_id]) VALUES ('"+newLink.title+"','"+newLink.url+"','"+newLink.description+"','"+newLink.user_id+"')");

    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {

    // Obtine el año y mes actual para realizar la primer consulta por periodo
    var Año = new Date().getFullYear();
    // Enero = 0, por eso se suma 1
    var Mes = new Date().getMonth()+1;

    // Arma el query
    var query ="select A.Tipo_Trama,A.Poid_Factura,A.Num_Control,A.Codigo_SAP,B.idOperador,A.Año,A.Mes,A.Fecha,REPLACE(CONVERT(VARCHAR(50),(CAST(a.Monto AS money)), 1),'.00', '') as Monto,c.descripcion as Moneda \
    FROM [SILO].[dbo].[ContaTramas] A,[SILO].[dbo].[Param_FacturaOperador] B,[SILO].[dbo].[Moneda] C \
    where A.Año="+Año+" and A.Mes ="+Mes+" and A.Poid_Factura = B.NumFactura and a.Id_Moneda=c.idMoneda \
     union all \
   select A.Tipo_Trama,A.Poid_Factura,A.Num_Control,A.Codigo_SAP,B.idOperador,A.Año,A.Mes,A.Fecha,REPLACE(CONVERT(VARCHAR(50),(CAST(a.Monto AS money)), 1),'.00', '') as Monto,c.descripcion as Moneda \
    FROM [SILO].[dbo].[ContaTramas] A,  [SILO].[dbo].[Facturacion_Operadores_Mensual] B,[SILO].[dbo].[Moneda] C \
    where A.Año="+Año+" and A.Mes ="+Mes+" and A.Poid_Factura in (substring(B.NumFactura,4,20),B.NumFactura) and a.Id_Moneda=c.idMoneda";

    // Realiza la consulta
    var consulta = await pool_BDSILOV3.query(query);

    // Extrae un recordset de la consulta
    registros= consulta.recordset;
    res.render('Tramas/Tramas', { registros });
});

router.post('/', isLoggedIn, async (req, res) => {
    
    const { date_MMYYYY,tipo_trama } = req.body;

    // Obtine el año y mes solicitados por el usuario
    var Año = date_MMYYYY.substr(3, 4);
    var Mes = date_MMYYYY.substr(0, 2);
    
    if (Año == 'AAAA'){
        // Si el año no es valido, asiga el periodo actual
        Año=new Date().getFullYear();
        Mes = new Date().getMonth()+1;
    }

    // Arma el query
    var query ="select A.Tipo_Trama,A.Poid_Factura,A.Num_Control,A.Codigo_SAP,B.idOperador,A.Año,A.Mes,A.Fecha,REPLACE(CONVERT(VARCHAR(50),(CAST(a.Monto AS money)), 1),'.00', '') as Monto,c.descripcion as Moneda \
    FROM [SILO].[dbo].[ContaTramas] A,[SILO].[dbo].[Param_FacturaOperador] B,[SILO].[dbo].[Moneda] C \
    where  a.Tipo_Trama='"+tipo_trama+"' and A.Año="+Año+" and A.Mes ="+Mes+" and A.Poid_Factura = B.NumFactura and a.Id_Moneda=c.idMoneda \
    union all \
    select A.Tipo_Trama,A.Poid_Factura,A.Num_Control,A.Codigo_SAP,B.idOperador,A.Año,A.Mes,A.Fecha,REPLACE(CONVERT(VARCHAR(50),(CAST(a.Monto AS money)), 1),'.00', '') as Monto,c.descripcion as Moneda \
    FROM [SILO].[dbo].[ContaTramas] A,  [SILO].[dbo].[Facturacion_Operadores_Mensual] B,[SILO].[dbo].[Moneda] C \
    where a.Tipo_Trama='"+tipo_trama+"' and A.Año="+Año+" and A.Mes ="+Mes+" and A.Poid_Factura in (substring(B.NumFactura,4,20),B.NumFactura) and a.Id_Moneda=c.idMoneda"

    // Valida las tramas de recaudación ya que se procesan diferente
    if (tipo_trama=='PREPAGO-RECAUDACION') {
        query ="SELECT A.Tipo_Trama,A.Fecha_Vencimiento as Poid_Factura,A.Num_Control,A.Codigo_SAP,B.idOperador,A.Año,A.Mes,A.Fecha,REPLACE(CONVERT(VARCHAR(50),(CAST(a.Monto AS money)), 1),'.00', '') as Monto,c.descripcion as Moneda \
        FROM [SILO].[dbo].[ContaTramas] A,[SILO].[dbo].[Contabilidad_DepositoOperador] B,[SILO].[dbo].[Moneda] C \
        where A.Año=2019  and A.mes=7 and A.Tipo_Trama='PREPAGO-RECAUDACION' and a.Fecha_Vencimiento=b.numComprobante and a.Id_Moneda=c.idMoneda"
    }

    // Realiza la consulta
    var consulta = await pool_BDSILOV3.query(query);
    

    // Extrae un recordset de la consulta
    registros= consulta.recordset;    
    res.render('Tramas/Tramas', { registros });
});


router.get('/regeneraTramas/', async (req, res) => {
    const { factura } = req.params;

    // Ejecuta procedimiento que envía la factura a FISCO
    pool_BDSILOV3.query("EXEC msdb.dbo.sp_start_job 'Tramas Contables'");
    
    res.redirect('/Tramas');
});


router.post('/poneNumControl/', isLoggedIn, async (req, res) => {

   //Obtine el número de control indicado por el usuario
    const { Factura,Num_Control,Año,Mes,Tipo_Trama } = req.body;
    
    
    // Cambia el valor del Numero de Control de GICE
    if (Tipo_Trama != 'PREPAGO-RECAUDACION') {
        await pool_BDSILOV3.query("update [SILO].[dbo].[ContaTramas] set Num_Control="+Num_Control+" where Poid_Factura='"+Factura+"' and año="+Año+" and mes ="+Mes+"");
    }else{
        await pool_BDSILOV3.query("update [SILO].[dbo].[ContaTramas] set Num_Control="+Num_Control+" where Fecha_Vencimiento='"+Factura+"' and año="+Año+" and mes ="+Mes+"");
    }

});


router.post('/poneCodigoSAP/', isLoggedIn, async (req, res) => {

    //Obtine el número de control indicado por el usuario
    const { Factura,CodigoSAP,Año,Mes,Tipo_Trama } = req.body;
    
    // Cambia el valor del Numero de Control de GICE
    if (Tipo_Trama != 'PREPAGO-RECAUDACION') {
        await pool_BDSILOV3.query("update [SILO].[dbo].[ContaTramas] set Codigo_SAP="+CodigoSAP+" where Poid_Factura='"+Factura+"' and año="+Año+" and mes ="+Mes+"");
    }else{
        await pool_BDSILOV3.query("update [SILO].[dbo].[ContaTramas] set Codigo_SAP="+CodigoSAP+" where Fecha_Vencimiento='"+Factura+"'");
    }
    
});


router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool_BDSILOV3.query("DELETE FROM links WHERE ID = '"+ id + "'");
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async (req, res) => {
    
    const { id } = req.params;
    

    const links = await pool_BDSILOV3.query("SELECT * FROM links WHERE id = '"+ id + "'");
    
    links2= links.recordset[0];

    //res.render('links/edit', {link: links[0]});
    res.render('links/edit', {link: links2});
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, url} = req.body; 
    const newLink = {
        title,
        description,
        url
    };

    await pool_BDSILOV3.query("UPDATE links set title='"+title+"',description='"+description+"',url='"+url+"' where id='"+id+"'");
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links');
});

module.exports = router;

