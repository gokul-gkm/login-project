const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('username').trim().isLength({ min: 4 }).withMessage('Username must be at least 4 characters').bail(),
  body('password').trim().isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('confirmpassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    .withMessage('Passwords do not match'),
];
  
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);


    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      req.flash('passworderror', errors.array()[0].msg ? errors.array()[1].msg : errors.array()[0].msg);
      req.flash('emailError', errors.array()[2].msg)
      req.flash('confirmpasswordError', errors.array()[3].msg)
      return res.redirect("/route/signup");
    }
    next();
  };
  
  module.exports = { validateSignup, checkValidation };