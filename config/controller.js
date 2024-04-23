let { userdb, admindb, moviedb } = require('../mongodb');
const flash = require('connect-flash');
// const { validateSignup, checkValidation } = require('./public/assets/js/validationMiddleware');
const { body, validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.create = async(req, res) => {  
    //validate request
    if (!req.body) {
        req.flash('addusererror', 'user not added');
        return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        // Flash the first error message and redirect
        req.flash('usernameError', errors.array({ onlyFirstError: true })[0]?.msg || '');
        req.flash('passwordError', errors.array({ onlyFirstError: true })[1]?.msg || '');
        req.flash('error', errors.array()[0].msg);
        return res.redirect('/admin/add-user');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    //new user
    const user = new userdb({
        name: req.body.name,
        password: hashedPassword,
        email: req.body.email,
    })

    user
        .save(user)
        .then(data => {
            res.redirect('/admin/add-user')
        }).catch(err => {
            req.flash('addusererror', 'user not added');
            res.redirect('/admin/add-user');
        });  
}

exports.find = (req, res) => {
    if (req.query.id) {
        const id = req.query.id;

        userdb.findById(id)
            .then(data => {
                if (!data) {
                res.status(404).send({message:`Not found user with id ${id}`})
                } else {
                res.send(data)
            }
        })
        .catch(err => {
        res.status(500).send({message:err.message || "Error occured while retrieving user information"})
    })
    } else {
        userdb.find()
        .then(user => {
        res.send(user)
        })
        .catch(err => {
        res.status(500).send({message:err.message || "Error occured while retrieving user information"})
    })
    }
}

exports.update = async(req, res) => {
    if (!req.body) {
        return res
            .status(404)
            .send({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    if (req.body.newpassword) {
        req.body.password = await bcrypt.hash(req.body.newpassword, saltRounds);
    }
    
    userdb.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
            res.status(404).send({message:`Cannot Update user with ${id}. Maybe user not found!`})
            } else {
                res.send(data);
            }
            req.session.username = req.body.name;
        })
        .catch(err => {
        res.status(500).send({message:"Error Update user information"})
    })
}


exports.delete = (req, res) => {
    id = req.params.id;
    userdb.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: `Cannot delete with ${id}. May be id is wrong` })
            } else {
                res.send({
                    message: "User was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Could not delete User with id ${id}`
            });
        });
}

exports.findAdmin = (req, res) => {
    if (req.query.id) {
        const id = req.query.id;

        admindb.findById(id)
            .then(data => {
                if (!data) {
                res.status(404).send({message:`Not found user with id ${id}`})
                } else {
                res.send(data)
            }
        })
        .catch(err => {
        res.status(500).send({message:err.message || "Error occured while retriving user information"})
    })
    } else {
        admindb.find()
        .then(user => {
        res.send(user)
        })
        .catch(err => {
        res.status(500).send({message:err.message || "Error occured while retriving user information"})
    })
    }
}