const { body, validationResult } = require("express-validator");
const { HttpStatus } = require("../config/constants");

const allowedRoles = ["Customer", "Admin"];
const philippineContactNumberPattern = /^(09|\+639)\d{9}$/;

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(HttpStatus.BAD_REQUEST).json({
    success: false,
    errors: errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
    })),
  });
};

const registerValidation = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required")
    .bail()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .normalizeEmail(),

  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters"),

  body("role")
    .optional()
    .isIn(allowedRoles)
    .withMessage('Role must be either "Customer" or "Admin"'),

  handleValidationErrors,
];

const loginValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .normalizeEmail(),

  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .notEmpty()
    .withMessage("Password cannot be empty"),

  handleValidationErrors,
];

const updateUserValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),

  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .normalizeEmail(),

  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string")
    .bail()
    .trim()
    .isLength({ min: 4 })
    .withMessage("Username must contain at least 4 characters"),

  body("password")
    .optional()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters"),

  body("role")
    .optional()
    .isIn(allowedRoles)
    .withMessage('Role must be either "Customer" or "Admin"'),

  body("contactNumber")
    .optional()
    .matches(philippineContactNumberPattern)
    .withMessage("Please enter a valid Philippine contact number"),

  body("address")
    .optional()
    .isObject()
    .withMessage("Address must be an object"),

  body("address.street")
    .optional()
    .isString()
    .withMessage("Street must be a string")
    .bail()
    .trim(),

  body("address.barangay")
    .optional()
    .isString()
    .withMessage("Barangay must be a string")
    .bail()
    .trim(),

  body("address.city")
    .optional()
    .isString()
    .withMessage("City must be a string")
    .bail()
    .trim(),

  body("address.province")
    .optional()
    .isString()
    .withMessage("Province must be a string")
    .bail()
    .trim(),

  body("address.postalCode")
    .optional()
    .isString()
    .withMessage("Postal code must be a string")
    .bail()
    .trim(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  updateUserValidation,
};
