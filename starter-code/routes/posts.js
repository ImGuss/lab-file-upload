const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const passport   = require('passport');
const bodyParser = require('body-parser');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

const User     = require('../models/user');
const Post     = require('../models/posts');
const Comments = require('../models/comments');

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


postRoute.post('/posts/new',
  ensureLoggedIn('login'),
  myUploader.single('postImage'),
  (req, res, next) => {

    const postContent = req.body.postContent;
    const userId = req.user._id;
    const postImage = req.file.filename;
    const postName = req.body.postName;

    const newPost = new Post({
      content: postContent,
      creatorId: userId,
      picPath: `/uploads/${postImage}`,
      picName: postName
    });

    newPost.save( (err) => {
      if (err) {
        next(err);
        return;
      }

      req.flash('success', 'Your post was saved successfully');
      res.redirect('/posts');
    });
  }
);


// list user's posts
postRoute.get('/posts', ensureLoggedIn('login'), (req, res, next) => {

  Post.find(
    { creatorId: req.user.id },
    (err, postList) => {
      if (err) {
        next(err);
        return;
      }

      if (!postList) {

        res.render('posts/list-post', {message: 'You have no posts.'});
      }

      if (postList) {
        res.render('posts/list-post', {
          posts: postList,
          message: req.flash('success')
        });
      }
    }
  );
});

// list all posts
postRoute.get('/posts/all', (req, res, next) => {

  Post.find(
    (err, postList) => {
      if (err) {
        next(err);
        return;
      }

      if (!postList) {
        res.render('posts/all-post', {message: 'No posts exist'});
      }

      if (postList) {
        res.render('posts/all-post', {
          posts: postList,
          message: req.flash('success')
        });
      }
    }
  );
});


postRoute.post('/comments/:id',
  myUploader.single('imagePath'),
  (req, res, next) => {

    const userId = req.user._id;
    const postId = req.params.id;

    User.findById(userId, (err, theUser) => {
      if(err) {
        next(err);
        return;
      }

      console.log('theUser~~~~~~~~~~~~~~~~~~~~~~~~');
      console.log(theUser);

      const newComment = {
        content: req.body.commentInput,
        authorName: theUser.username,
        authorId: req.user._id,
        imagePath: `/uploads/${req.file.filename}`,
        imageName: req.body.imageName
      };

      Post.findByIdAndUpdate(
        postId,
        {$push: {comments: newComment}},
        (err, comment) => {
          if (err) {
            next(err);
            return;
          }


          req.flash('success', 'Your comment was saved');
          res.redirect('/posts/all');
        }
      );
    });
  }
);

module.exports = postRoute;
