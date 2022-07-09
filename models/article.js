const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-generator');
//Initialize
mongoose.plugin(slug);

const articleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "There is no user tied to this article, login and try again"],
    },
    authorId: {
      type: String,
    
    },
    title: {
      type: String,
      required: [true, "Title is Required"],
    },
    slug: { type: String, slug: "title", unique: true, },
    body: {
      type: String,
      required: [true, "Body is required"],
    },
    author: {
      type: String,
      required: [true, "An Author is required"],
    },
    photo: {
      type: String,
      default: "https://racktronics.com.au/pub/static/frontend/Magento/blank/en_US/Magebuzz_Testimonial/images/default-avatar.jpg",
    },
    comment: [{
      type: mongoose.Types.ObjectId,
      ref: "Comment"
   }],
    views: {
      type: Number,
      min: 0,
      default: 0
    },
    createdOn: {
      type: Date,
      default: new Date().toISOString(),
    },
  },
  { timestamps: true }
);

articleSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.sort("-createdAt");
  next();
});

articleSchema.plugin(uniqueValidator);


const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
