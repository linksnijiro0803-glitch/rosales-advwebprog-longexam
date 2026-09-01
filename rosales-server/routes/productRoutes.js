const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controller/productController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const router = express.Router();

router.route("/").post(authentication, authorize("Admin"), createProduct).get(getProducts);
router
  .route("/:id")
  .get(getProductById)
  .put(authentication, authorize("Admin"), updateProduct)
  .delete(authentication, authorize("Admin"), deleteProduct);

module.exports = router;
