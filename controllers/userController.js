const User = require("./../models/userModel");
const Article = require("./../models/article");
const Comment = require("./../models/comment");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");

const excludeUserDetails = '-mfaEnabled -mfaSecret -requireMfa'
const excludeArticleDetails = '-comment'


const filterObj = (obj, ...restrictedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (!restrictedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates. Please use /updateMyPassword.", 400));
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const updateData = filterObj(req.body, "email", "active", "role", "cron");

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  await Article.update({user: updateData.user}, {photo: updateData.photo, author: `${updateData.firstName} ${updateData.lastName}`}, { multi: true });
  await Article.update({editorId: updateData.user}, {editor: `${updateData.firstName} ${updateData.lastName}`}, { multi: true });
  await Comment.update({user: updateData.user}, {photo: updateData.photo, editor: `${updateData.firstName} ${updateData.lastName}`}, { multi: true });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user).select("+password");
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect password!.", 401));
  }
  await user.updateOne({ active: false });

  res.status(204).json({
    status: "success",
    data: null,
    message: "Account deactivated!",
  });
});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User does not exist!", 404));
  }
  await user.updateOne({ active: false });

  res.status(200).json({
    status: "success",
    data: null,
    message: "Account deactivated!",
  });
});

exports.activateUser = catchAsync(async (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  await User.updateOne({ _id: id }, { active: true });

  res.status(200).json({
    status: "success",
    data: null,
    message: "Account activated!",
  });
});


exports.getUser = factory.getOne(User);

exports.getInactiveUser = catchAsync(async (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const doc = await User.aggregate([
    {
      $match: { _id: id, active: { $ne: true } },
    },
  ]);

  if (doc.length < 1) {
    return next(new AppError("This user does not exist or is active!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.getAllInactiveUsers = catchAsync(async (req, res, next) => {
  const doc = await User.aggregate([
    {
      $match: { active: { $ne: true } },
    },
  ]);
  res.status(200).json({
    status: "success",
    result: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getAllUsersRestricted = catchAsync(async (req, res, next) => {
  const doc = await User.find({ role: { $ne: "master" } }).select(excludeUserDetails);

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getAccountRestricted = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const doc = await User.findById({_id: id}).select(excludeUserDetails).populate({path: 'article', select: excludeArticleDetails});

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const doc = await User.find({ role: { $ne: "master" } }).select(excludeUserDetails);

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const doc = await User.findById({_id: id}).select(excludeUserDetails).populate('article');

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});



exports.masterUpdate = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const doc = await User.findById({_id: id});

  if (!doc) {
    return next(new AppError("User does not exist, try again!", 404));
  }

  const payload = {
    ...req.body
  }

  await doc.updateOne(payload);

  res.status(200).json({
    status: "success",
    message: "User account updated",
  });
});


 exports.deleteUser =  async (req, res, next) => {  
    User.deleteOne({_id: req.params.id}).then(() => {
        res.status(200).json({
          message: `User deleted successfully!`
        });
    }).catch(
      (error) => {
        res.status(400).json({
           error: `Something went wrong, try again! ${error}`
        });
      }
    );
  }
  
// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
