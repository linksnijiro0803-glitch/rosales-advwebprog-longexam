const express = require("express");
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controller/supplierController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const router = express.Router();

router.route("/").post(authentication, authorize("Admin"), createSupplier).get(getSuppliers);
router
  .route("/:id")
  .get(getSupplierById)
  .put(authentication, authorize("Admin"), updateSupplier)
  .delete(authentication, authorize("Admin"), deleteSupplier);

module.exports = router;
