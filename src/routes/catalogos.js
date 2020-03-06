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
    const links = await pool_BDSILOV3.query("SELECT top 100 convert(varchar,fecha) fecha,compra,venta,tbp,prime,compra_Sector_Publico,venta_Sector_Publico,REPLACE(CONVERT(VARCHAR(50),(CAST(salario_base AS money)), 1),'.00', '') as salario_base FROM Param_IndicadoresBancoCentral order by fecha desc");

    const { id, usuario } = req.body;

    usuarios= links.recordset;
    
    res.render('Catalogos/BancoCentral', { usuarios });
});



router.get('/listar_BancoCentral', isLoggedIn, async (req, res) => {
    const query = await pool_BDSILOV3.query("SELECT convert(varchar,fecha) fecha,compra,venta,tbp,prime,compra_Sector_Publico,venta_Sector_Publico,REPLACE(CONVERT(VARCHAR(50),(CAST(salario_base AS money)), 1),'.00', '') as salario_base FROM Param_IndicadoresBancoCentral order by fecha desc");


    indicadores= query.recordset;
    
    res.json(indicadores);
});


router.post('/', isLoggedIn, async (req, res) => {
    
    const {date_MMDDYYYY } = req.body;

    const links = await pool_BDSILOV3.query("SELECT top 30 convert(varchar,fecha) fecha,compra,venta,tbp,prime,compra_Sector_Publico,venta_Sector_Publico,REPLACE(CONVERT(VARCHAR(50),(CAST(salario_base AS money)), 1),'.00', '') as salario_base FROM Param_IndicadoresBancoCentral where fecha>='"+date_MMDDYYYY+"'");

    usuarios= links.recordset;
    //console.log(usuarios);
    res.render('Catalogos/BancoCentral', { usuarios });
});



router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool_BDSILOV3.query("DELETE FROM links WHERE ID = '"+ id + "'");
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async (req, res) => {
    console.log('prueba');
    const { id } = req.params;
    

    const links = await pool_BDSILOV3.query("SELECT * FROM links WHERE id = '"+ id + "'");
    console.log(links);
    links2= links.recordset[0];
    console.log(links2);
    console.log(links2.id);

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

    console.log(id,title,description,url)

    await pool_BDSILOV3.query("UPDATE links set title='"+title+"',description='"+description+"',url='"+url+"' where id='"+id+"'");
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links');
});

module.exports = router;

