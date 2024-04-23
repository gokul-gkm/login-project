const express = require('express');
const router = express.Router();
const session = require('express-session');
const { userdb,moviedb } = require("../mongodb.js");
const { body, validationResult } = require('express-validator');
const { validateSignup, checkValidation } = require('../public/assets/js/validationMiddleware.js');
const { existsSync } = require('fs');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.username) {
      return next();
    } else {
      return res.redirect('/');
    }
};
router.use(flash());

router.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
})

router.get('/signup', (req, res) => {
    req.session.logout = '';

    if (req.session.username) {
        res.redirect('/route/home')
    } else if (req.session.admin) {
        res.render('dashboard',{users:req.session.users});
    }
    else{
        res.render("signup")
    }  
})

router.post("/signup", checkValidation, validateSignup, async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect('/route/signup');
    }
    
    try {   
        
        const existingUser = await userdb.findOne({ name: req.body.username });
        const emailCheck = await userdb.findOne({ email: req.body.email });

        if (existingUser) {
            req.flash('error', 'Username already exists');
            return res.redirect("/route/signup");
        }
        if (emailCheck) {
            req.flash('emailError', 'Email already exists');
            return res.redirect("/route/signup");
        }
        
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const data = {
            name: req.body.username,
            password: hashedPassword,
            email: req.body.email
        }
        await userdb.insertMany([data])
        req.session.logout = 'Signup Successful';
        req.flash('success', 'Login successful');
        res.redirect("/")
    } catch (err){
        console.error('Error during signup:', err);
        req.flash('error', 'Signup failed');
        res.redirect('/route/signup');
    }
})

router.post("/login", async(req, res) => {
    try {
        console.log('Received login request with email:', req.body.email);

        const user = await userdb.findOne({ email: req.body.email });
  
        console.log('Database check result:', user);

        if (!user) {
            // Invalid username
            req.flash('usernameError', 'Invalid username');
            res.redirect('/');
        }
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (passwordMatch) {
            req.session.userId = user._id;
            req.session.username = user.name;
            req.flash('success', 'Login successful');
            res.redirect("/route/home")
           
        } else {
            // Valid username, but incorrect password
            req.flash('usernameSuccess', 'valid username');
            req.flash('error', 'Incorrect password');
            res.redirect('/');
        }
    }
    catch (error) {
        console.error('Error during login:', error);
        res.send('An error occurred during login');

    }
})

router.get("/home", isAuthenticated, async (req, res) => {
    const locals = {
      title: 'Home Page'
    }
const userName=await userdb.findOne({_id:req.session.userId})
    if (req.session.userId) {
        if (userName) {
            try {
                // Fetch movies from the database
                const movies = await moviedb.find();
    
                res.render("home", {
                    locals,
                    user:userName.name,
                    movies, // Pass the movies data to the view
                });
            } catch (error) {
                console.error('Error fetching movies:', error);
                res.status(500).send('Internal Server Error');
            }
        } else {
            req.session.userId = undefined;

            res.redirect('/')
        }
     
    } else {
        req.session.username = undefined;
        req.session.logout = undefined;
        res.redirect('/')
        // res.send('Unauthorize user');
    }
});

router.post('/logout', (req, res) => {
    req.session.username = undefined;
    req.session.logout = 'Logout successfully';
    res.redirect('/');
});

module.exports = router;