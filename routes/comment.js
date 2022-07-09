const express = require("express");
const contactController = require("../controllers/comment");
const authController = require("../controllers/authController");

const router = express.Router();
router.use(authController.protect); 

router.post("/", contactController.createComment);
router.get("/", contactController.getComments);
router.delete("/:id", contactController.deleteComment);

module.exports = router;
