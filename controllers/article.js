const mongoose = require("mongoose");
const Article = require("../models/article");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const excludeUserDetails = 'photo article firstName lastName _id'


//GENERAL

exports.getArticles = catchAsync(async (req, res, next) => {
  const doc = await Article.find().populate("user", excludeUserDetails);

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});


exports.getMyArticles = catchAsync(async (req, res, next) => {

  const doc = await Article.find({ user: mongoose.Types.ObjectId(req.user._id)});

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getMyArticle = catchAsync(async (req, res, next) => {
  const doc = await Article.find({ _id: req.params.id}).populate('comment');
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.createArticle = catchAsync(async (req, res, next) => {

  const articles = new Article({
    ...req.body,
  })

  const article = await articles.save();
  await User.findOneAndUpdate({_id: req.body.user}, {$push: {article}})
 
  res.status(201).json({
    status: "success",
    message: `Article ${req.body.title} created successfully`,
    data: {
      data: article,
    },
  });
})


exports.updateArticle = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const doc = await Article.findOne({ _id: id }).populate("user");
  if (!doc) {
    return next(new AppError("Article id does not exist, try again!", 404));
  }

  const payload = {
    ...req.body,
    createdAt: new Date().toISOString()
  }

  await doc.updateOne(payload, {timestamps: false});
  res.status(200).json({
    status: "success",
    message: `Article updated successfully!`,
  });
});


exports.getOneArticleSlug = catchAsync(async (req, res, next) => {
  const doc = await Article.findOne({slug: req.params.slug}).populate('comment');
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});


exports.deleteArticle = factory.deleteOne(Article);
