const express = require("express");
const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controller/reviewController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const router = express.Router();

router.route("/").post(authentication, authorize("Admin", "Customer"), createReview).get(getReviews);
router
  .route("/:id")
  .get(getReviewById)
  .put(authentication, authorize("Admin", "Customer"), updateReview)
  .delete(authentication, authorize("Admin", "Customer"), deleteReview);

module.exports = router;
