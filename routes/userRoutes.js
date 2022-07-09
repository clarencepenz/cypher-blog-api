const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/authors/:id", userController.getAccountRestricted);
router.get("/authors", userController.getAllUsersRestricted); 


router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.get("/logout", authController.logout);
router.patch("/updatePasswoord", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);
router.post("/deactivate", userController.deactivateMe);

router.use(authController.restrictTo("master"));

router.route("/").get(userController.getAllUsers);
router.delete("/delete/:id", userController.deleteUser);
router.patch("/:id", userController.updateUser);


module.exports = router;
