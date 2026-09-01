const express = require("express");
const {
  createCart,
  getCarts,
  getCartById,
  updateCart,
  deleteCart,
} = require("../controller/cartController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const router = express.Router();

router
  .route("/")
  .post(authentication, authorize("Admin", "Customer"), createCart)
  .get(authentication, authorize("Admin", "Customer"), getCarts);
router
  .route("/:id")
  .get(authentication, authorize("Admin", "Customer"), getCartById)
  .put(authentication, authorize("Admin", "Customer"), updateCart)
  .delete(authentication, authorize("Admin", "Customer"), deleteCart);

module.exports = router;
