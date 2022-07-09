const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "There is no user tied to this article, login and try again"],
    },
    article: {
      type: mongoose.Types.ObjectId,
      ref: "Article"
   },
    body: {
      type: String,
      required: [true, "Enter a comment"],
    },
    commentBy: {
      type: String,
      default: "https://res.cloudinary.com/cryptokes/image/upload/v1630621454/cryptokes_img_kuf0q4.png",
    },
    photo: {
      type: String,
    },
  },
  { timestamps: true }
);

commentSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.sort("-createdAt");
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
