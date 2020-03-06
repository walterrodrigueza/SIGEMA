const express = require('express');
const router = express.Router();

const pool = require('../database');
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
    
    
    await pool.query("INSERT INTO [dbo].[links] ([title],[url],[description],[user_id]) VALUES ('"+newLink.title+"','"+newLink.url+"','"+newLink.description+"','"+newLink.user_id+"')");

    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {
    const links = await pool.query("SELECT * FROM links WHERE user_id = '"+ [req.user.recordset[0].id] + "'");
    links2= links.recordset;    
    console.log(links2);
    res.render('links/list', { links2 });
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM links WHERE ID = '"+ id + "'");
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async (req, res) => {
    console.log('prueba');
    const { id } = req.params;
    

    const links = await pool.query("SELECT * FROM links WHERE id = '"+ id + "'");
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

    await pool.query("UPDATE links set title='"+title+"',description='"+description+"',url='"+url+"' where id='"+id+"'");
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links');
});

module.exports = router;