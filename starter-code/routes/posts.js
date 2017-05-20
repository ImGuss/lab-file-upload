const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const bcrypt     = require('bcrypt');
const passport   = require('passport');
const bodyParser = require('body-parser');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

const User = require('../models/user');
const Post = require('../models/posts');

const postRoute = express.Router();

const myUploader = multer({
  dest: path.join(__dirname, '../public/uploads')
});


// add a new post
postRoute.get('/posts/new',
  ensureLoggedIn('/login'),
  (req, res, next) => {
    res.render('posts/new-post', {message: req.flash('error')
  });
});

module.exports = postRoute;
