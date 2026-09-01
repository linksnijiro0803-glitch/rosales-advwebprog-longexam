const express = require("express");
const {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controller/articleController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const router = express.Router();

router.route("/").get(getArticles).post(authentication, authorize("Admin"), createArticle);
router.get("/:slug", getArticleBySlug);
router
  .route("/:id")
  .put(authentication, authorize("Admin"), updateArticle)
  .delete(authentication, authorize("Admin"), deleteArticle);

module.exports = router;
