const express = require('express');
const app = express();
const path = require('path');
const users = require("./mongodb");
const { Collection } = require('mongoose');
const session = require('express-session');
const router = require('./routes/router');
const admin = require('./routes/admin')
const nocache = require('nocache');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config({ path: 'config.env' });
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));


app.use(flash());

app.use(nocache());

app.use('/route', router);
app.use('/admin', admin);

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
})

app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

app.get('/', (req, res) => {
    req.session.adminlogout = '';

    if (req.session.username) {
        res.redirect('/route/home')
    } else if (req.session.admin) {
        res.render('dashboard',{users:req.session.users});
    } else if (req.session.logout) {
        res.render('login', { logout: req.session.logout });
    }
    else {
        res.render("login",{logout:''})
    }  
})

app.listen(port, () => {
    console.log(`Listening to the server on http://localhost:${port}`);
})