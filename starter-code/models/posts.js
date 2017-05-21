const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema (
  {
    content:   String,
    creatorId: Schema.Types.ObjectId,
    picPath:   String,
    picName:   String,
    comments: [
      {
        content:    String,
        authorName: String,
        authorId:   Schema.Types.ObjectId,
        imagePath:  String,
        imageName:  String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model('Post', postSchema);


module.exports = Post;
