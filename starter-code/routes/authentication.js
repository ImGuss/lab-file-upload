const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const bcrypt     = require('bcrypt');
const passport   = require('passport');
const bodyParser = require('body-parser');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');


const User       = require('../models/user');

const router     = express.Router();

const myUploader = multer({
  dest: path.join(__dirname, '../public/uploads')
});


// user sign in
router.get('/login', ensureLoggedOut('/'), (req, res) => {
    res.render('authentication/login', { message: req.flash('error')});
});

router.post('/login', ensureLoggedOut('/'), passport.authenticate('local-login', {
  successRedirect : '/',
  failureRedirect : '/login',
  failureFlash : true
}));



// user signup
router.get('/signup', ensureLoggedOut('/'), (req, res, next) => {
    res.render('authentication/signup', { message: req.flash('error')});
});

router.post('/signup',
  ensureLoggedOut('/'),
  myUploader.single('filename'),
  // passport.authenticate('local-signup', {
  //   successRedirect : '/',
  //   failureRedirect : '/signup',
  //   failureFlash : true
  // }),
  (req, res, next) => {

    const signupUsername = req.body.signupUsername;
    const signupEmail    = req.body.signupEmail;
    const signupPassword = req.body.signupPassword;

    if (signupUsername === '' || signupPassword === '' || signupEmail === '') {
      res.render('authentication/signup', {
        error: 'Please provide Username, Email and Password.'
      });
      return;
    }

    User.findOne(
      {email: signupEmail},
      (err, theUser) => {
        if (err) {
          next(err);
          return;
        }

        if (theUser) {
          res.render('authentication/signup', {
            error: 'You already have an account.'
          });
          return;
        }
      }
    );

    User.findOne(
      {username: signupUsername},
      (err, theUser) => {

        if (theUser) {
          res.render('authentication/signup', {
            error: 'Username is already taken.'
          });
          return;
        }

        const salt = bcrypt.genSaltSync(10);

        const hashPass = bcrypt.hashSync(signupPassword, salt);

        const newUser = new User ({
          username: signupUsername,
          email: signupEmail,
          password: hashPass,
          photo: `/uploads/${req.file.filename}`,
        });

        newUser.save( (err) => {
          if (err) {
            next(err);
            return;
          }

          req.flash('success', `Welcome, ${signupUsername}!`);

          res.redirect('/profile');
        }
      );
    });
  }
);



router.get('/profile', ensureLoggedIn('/login'), (req, res) => {
    res.render('authentication/profile', {
        user : req.user
    });
});

router.get('/logout', ensureLoggedIn('/login'), (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
