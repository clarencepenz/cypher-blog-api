const express = require("express");
const articleController = require("../controllers/article");
const authController = require("../controllers/authController");

const router = express.Router();

//Public Route
router.get("/", articleController.getArticles);
router.get("/:slug", articleController.getOneArticleSlug);



router.use(authController.protect); 


//Personal Routes
router.post("/", articleController.createArticle);




module.exports = router;
