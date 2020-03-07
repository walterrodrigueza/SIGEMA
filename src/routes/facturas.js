const express = require('express');
const router = express.Router();

const pool_BDSILOV3 = require('../database_SILO');
const { isLoggedIn } = require('../lib/auth');

const swal = require('body-parser'); //libreria para mensajes en pantalla


router.get('/add', (req, res) => {
    res.render('links/add');
});

router.post('/add', async(req, res) => {
    const { title, url, description } = req.body;
    const newLink = {
        title,
        url,
        description,
        user_id: req.user.recordset[0].id
    };


    await pool_BDSILOV3.query("INSERT INTO [dbo].[links] ([title],[url],[description],[user_id]) VALUES ('" + newLink.title + "','" + newLink.url + "','" + newLink.description + "','" + newLink.user_id + "')");

    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async(req, res) => {
    const query = await pool_BDSILOV3.query("select top 100 NumFactura as Factura,AñoCobro as Año,MesCobro as Mes,idoperador as Operador,TotalPagar as Total,SUBSTRING(clave_fisco,22,20) as clave_fisco FROM [SILO].[dbo].[Facturacion_Operadores_Mensual] order by AñoCobro desc,SUBSTRING(NumFactura,4,4) desc");

    const { id, usuario } = req.body;


    facturas = query.recordset;
    res.render('Facturas/Listar', { facturas });
});

router.post('/', isLoggedIn, async(req, res) => {

    const { id, usuario, date } = req.body;

    const query = await pool_BDSILOV3.query("select top 100 NumFactura as Factura,AñoCobro as Año,MesCobro as Mes,idoperador as Operador,TotalPagar as Total,SUBSTRING(clave_fisco,22,20) as clave_fisco FROM [SILO].[dbo].[Facturacion_Operadores_Mensual] where FechaEmision>='" + date + "' order by AñoCobro asc,SUBSTRING(NumFactura,4,4) asc");

    facturas = query.recordset;


    res.render('Facturas/Listar', { facturas });

});


router.get('/envioFisco/:factura', async(req, res) => {
    const { factura } = req.params;

    // Ejecuta procedimiento que envía la factura a FISCO
    //await pool_BDSILOV3.query("exec [dbo].[Prc_Creacion_Factura_Electronica] '"+ factura + "',0");
    pool_BDSILOV3.query("exec [dbo].[Prc_Creacion_Factura_Electronica] '" + factura + "',0");

    console.log('factura enviada a FISCO ' + factura)
    res.redirect('/Facturas/' + factura);
});

router.get('/verArchivos/:factura', async(req, res) => {
    const { factura } = req.params;

    console.log('Entro1');

    //res.redirect("file://10.135.47.23/Mediacion_Interconexion/");
    //res.redirect("http://nacion.com/");
    // Ejecuta procedimiento que envía la factura a FISCO
    //await pool_BDSILOV3.query("exec [dbo].[Prc_Creacion_Factura_Electronica] '"+ factura + "',0");
    //pool_BDSILOV3.query("exec [dbo].[Prc_Creacion_Factura_Electronica] '"+ factura + "',0");

    //console.log('factura enviada a FISCO '+factura)
    //res.redirect('/Facturas/'+factura);

    res.redirect('file://10.135.47.23/Mediacion_Interconexion/Respaldos/FISCO/Archivos/2019/50628022000400004213900991000010000000327100000000/');
    console.log('Entro2');
});


router.get('/regeneraTramas/', async(req, res) => {
    const { factura } = req.params;

    // Ejecuta procedimiento que envía la factura a FISCO
    pool_BDSILOV3.query("EXEC msdb.dbo.sp_start_job 'Tramas Contables'");

    // No se redirecciona porque no
    res.redirect('/facturas');
});


router.get('/:id', async(req, res) => {
    const { id } = req.params;

    console.log('1');

    // Consulta el maestro de la factura
    var query = await pool_BDSILOV3.query("select top 100 NumFactura as Factura,AñoCobro as Año,MesCobro as Mes,idoperador as Operador,REPLACE(CONVERT(VARCHAR(50), (CAST(TotalPagar AS money)), 1), '.00', '') as Total,clave_fisco as clave_fisco FROM [SILO].[dbo].[Facturacion_Operadores_Mensual] where NumFactura='" + id + "' order by AñoCobro asc,SUBSTRING(NumFactura,4,4) asc");
    facturas = query.recordset;

    //Consulta el detalle de la factura
    query = await pool_BDSILOV3.query("SELECT [Cantidad],[Unidad],[DetalleFactura],REPLACE(CONVERT(VARCHAR(50), (CAST(PrecioUnitario AS money)), 1), '.00', '')  as PrecioUnitario,REPLACE(CONVERT(VARCHAR(50), (CAST(Total AS money)), 1), '.00', '') as Total,[Idcontable],REPLACE(CONVERT(VARCHAR(50), (CAST(SaldoContable AS money)), 1), '.00', '') as SaldoContable,[idGrupo] FROM [SILO].[dbo].[Facturacion_Detalle_Final]  where NumeroFactura='" + id + "'");
    detalle = query.recordset;


    if (facturas[0].clave_fisco != 'Enviada') {
        facturas[0].clave_fisco = facturas[0].clave_fisco.substr(22, 20)
    }

    // Si la clave de fisco no trae información le pone mensaje
    if (facturas[0].clave_fisco == '') {
        facturas[0].clave_fisco = 'Enviar a FISCO'
    }


    //Consulta tramas de la factura
    query = await pool_BDSILOV3.query("select Tipo_Trama,Num_Control,Codigo_SAP,Documento,REPLACE(CONVERT(VARCHAR(50), (CAST(Monto AS money)), 1), '.00', '') as Monto,Comentario FROM [SILO].[dbo].[ContaTramas] where Poid_Factura='" + id.substr(3, 9) + "'");
    tramas = query.recordset;

    res.render('Facturas/Factura', { facturas, detalle, tramas });
});

router.get('/delete/:id', async(req, res) => {
    const { id } = req.params;
    await pool_BDSILOV3.query("DELETE FROM links WHERE ID = '" + id + "'");
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async(req, res) => {


    const { id } = req.params;

    const links = await pool_BDSILOV3.query("SELECT * FROM links WHERE id = '" + id + "'");
    links2 = links.recordset[0];

    //res.render('links/edit', {link: links[0]});
    res.render('links/edit', { link: links2 });
});

router.post('/edit/:id', async(req, res) => {
    const { id } = req.params;
    const { title, description, url } = req.body;
    const newLink = {
        title,
        description,
        url
    };

    console.log(id, title, description, url)

    await pool_BDSILOV3.query("UPDATE links set title='" + title + "',description='" + description + "',url='" + url + "' where id='" + id + "'");
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links');
});

module.exports = router;