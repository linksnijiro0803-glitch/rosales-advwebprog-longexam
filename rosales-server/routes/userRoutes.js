const express = require("express");
const {
  getUsers,
  createUser,
  registerUser,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controller/userController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");
const {
  loginLimiter,
  progressiveLoginProtection,
} = require("../middleware/rateLimiterMiddleware");
const {
  registerValidation,
  loginValidation,
  updateUserValidation,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post(
  "/login",
  loginLimiter,
  loginValidation,
  progressiveLoginProtection,
  loginUser
);
router
  .route("/")
  .get(authentication, authorize("Admin"), getUsers)
  .post(authentication, authorize("Admin"), registerValidation, createUser);
router
  .route("/:id")
  .put(authentication, authorize("Admin", "Customer"), updateUserValidation, updateUser)
  .delete(authentication, authorize("Admin"), deleteUser);
router.post("/session", loginValidation, loginUser);

module.exports = router;
