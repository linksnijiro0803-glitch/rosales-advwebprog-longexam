const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controller/orderController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const router = express.Router();

router
  .route("/")
  .post(authentication, authorize("Admin", "Customer"), createOrder)
  .get(authentication, authorize("Admin", "Customer"), getOrders);
router
  .route("/:id")
  .get(authentication, authorize("Admin", "Customer"), getOrderById)
  .put(authentication, authorize("Admin", "Customer"), updateOrder)
  .delete(authentication, authorize("Admin", "Customer"), deleteOrder);

module.exports = router;
