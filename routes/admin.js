const express = require('express');
const router = express.Router();
const session = require('express-session');
const controller = require('../config/controller.js');
const axios = require('axios')
const { admindb } = require("../mongodb.js");
const flash = require('connect-flash');
const { body, validationResult } = require('express-validator');
const { checkValidation } = require('../public/assets/js/validationMiddleware.js');

const validateSignup = [
    body('name').trim().isLength({ min: 4 }).withMessage('Username must be at least 4 characters').bail(),
    body('email').trim().isEmail().withMessage('Invalid email address').bail(),
    body('password').trim().isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
];

router.use(flash());

router.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
})

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.admin) {
      return next();
    } else {
          return res.redirect('/admin/login');      
    }
};
//admin login

router.get('/login', (req, res) => {
    req.session.logout = '';

    if (req.session && req.session.admin) {
        res.render('dashboard',{users:req.session.users});
    } else {
        res.render('admin_login',{adminlogout:req.session.adminlogout})
    }
})

router.post("/login", async(req, res) => {
    try {
        console.log('Received login request with username:', req.body.username);

        const check = await admindb.findOne({name:req.body.username
        });

        console.log('Database check result:', check);

        if (!check) {
            // Invalid username
            req.flash('usernameError', 'Invalid username');
            
            res.redirect('/admin/login');
        } else if (check.password === req.body.password) {
            console.log('Entered Password:', req.body.password);
            console.log('Database Password:', check.password);

            // Valid username and password
            req.session.admin = req.body.username;
            console.log("session admin"+req.session.admin)
            req.flash('success', 'Login successful');
            res.redirect("/admin/");
        } else {
            // Valid username, but incorrect password
            req.flash('usernameSuccess', 'valid username');
            req.flash('error', 'Incorrect password');
            res.redirect('/admin/login/');
        }

        req.flash('usernameError', '');
        req.flash('success', '');
        req.flash('usernameSuccess', '');
        req.flash('error', '');
    }
    catch (error) {
        console.error('Error during login:', error);
        res.send('An error occurred during login');
        res.redirect('/admin/login');
    }
})

//----admin dashboard route
router.get('/', isAuthenticated, (req, res) => {

    console.log("home route session:"+req.session.admin)
    if (req.session.admin) {
        axios.get('http://localhost:8080/admin/api/users')
        .then(function (response) {
            const users = response.data;
            req.session.users = users;
            res.render('dashboard',{users})
        })
        .catch(err => {
            res.send(err);
        }) 
    } else {
        res.send('Unauthorize admin');
    }
    
})

router.get('/add-user',isAuthenticated, (req, res) => {
    res.render('add_user');
});

router.get('/update-user', isAuthenticated, (req, res) => {
    axios.get('http://localhost:8080/admin/api/users', { params: { id: req.query.id } })
        .then(function (userdata) {
            req.session.username = userdata.name;
            res.render('update_user', { user: userdata.data })
        })
        .catch(err => {
            res.redirect('/admin/update-user')
        })
});

router.post('/logout', (req, res) => {
    req.session.admin = undefined;
    req.session.adminlogout = 'Logout successfully';
    res.redirect('/admin/login');
});

//API

router.post('/api/users',validateSignup, controller.create);
router.get('/api/users', controller.find);
router.put('/api/users/:id', controller.update);
router.delete('/api/users/:id', controller.delete);

module.exports = router;