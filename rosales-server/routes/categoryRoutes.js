const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const router = express.Router();

router.route("/").post(authentication, authorize("Admin"), createCategory).get(getCategories);
router
  .route("/:id")
  .get(getCategoryById)
  .put(authentication, authorize("Admin"), updateCategory)
  .delete(authentication, authorize("Admin"), deleteCategory);

module.exports = router;
