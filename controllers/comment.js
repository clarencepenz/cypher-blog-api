const Comment = require("../models/comment");
const Article = require("../models/article");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");



exports.createComment = catchAsync(async (req, res, next) => {

   const comments = new Comment({
    ...req.body,
  })

  const comment = await comments.save();
  await Article.findOneAndUpdate({_id: req.body.article}, {$push: {comment}})

  res.status(201).json({
    status: "success",
    message: `Comment added successfully`,
    data: {
      data: comment,
    },
  });
})


exports.getComments = catchAsync(async (req, res, next) => {
  const doc = await Comment.find().populate("user");

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getOneComment = factory.getOne(Comment, "user");

exports.deleteComment = factory.deleteOne(Comment);
