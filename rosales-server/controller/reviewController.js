const mongoose = require("mongoose");
const { HttpStatus } = require("../config/constants");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const reviewPopulate = [
  { path: "user", select: "-password" },
  { path: "product" },
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isAdmin = (req) => req.user?.role === "Admin";

const isOwnedByUser = (doc, userId) => doc?.user?._id?.toString?.() === userId || doc?.user?.toString?.() === userId;

const forbiddenResponse = (res) =>
  res.status(HttpStatus.FORBIDDEN).json({
    success: false,
    message: "Access denied",
  });

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "User has already reviewed this product",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Server error",
    error: error.message,
  });
};

const validateReviewReferences = async (body, reviewId = null) => {
  if (body.user !== undefined && body.user !== null) {
    if (!isValidObjectId(body.user)) {
      return { status: HttpStatus.BAD_REQUEST, message: "Invalid user ID" };
    }

    const userExists = await User.exists({ _id: body.user });
    if (!userExists) {
      return { status: HttpStatus.NOT_FOUND, message: "User not found" };
    }
  }

  if (body.product !== undefined && body.product !== null) {
    if (!isValidObjectId(body.product)) {
      return { status: HttpStatus.BAD_REQUEST, message: "Invalid product ID" };
    }

    const productExists = await Product.exists({ _id: body.product });
    if (!productExists) {
      return { status: HttpStatus.NOT_FOUND, message: "Product not found" };
    }
  }

  if (body.user && body.product) {
    const duplicateFilter = {
      user: body.user,
      product: body.product,
    };

    if (reviewId) {
      duplicateFilter._id = { $ne: reviewId };
    }

    const existingReview = await Review.findOne(duplicateFilter);
    if (existingReview) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "User has already reviewed this product",
      };
    }
  }

  return null;
};

const createReview = async (req, res) => {
  try {
    const body = {
      ...req.body,
      user: isAdmin(req) && req.body.user ? req.body.user : req.user.id,
    };

    const referenceError = await validateReviewReferences(body);
    if (referenceError) {
      return res.status(referenceError.status).json({
        success: false,
        message: referenceError.message,
      });
    }

    const review = await Review.create(body);
    await review.populate(reviewPopulate);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate(reviewPopulate).sort({ createdAt: -1 });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getReviewById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(req.params.id).populate(reviewPopulate);

    if (!review) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const currentReview = await Review.findById(req.params.id);

    if (!currentReview) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Review not found",
      });
    }

    if (!isAdmin(req) && !isOwnedByUser(currentReview, req.user.id)) {
      return forbiddenResponse(res);
    }

    const nextUser = isAdmin(req) && req.body.user ? req.body.user : currentReview.user;
    const nextProduct = req.body.product || currentReview.product;
    const body = {
      ...req.body,
      user: nextUser,
    };

    const referenceError = await validateReviewReferences(
      { ...body, product: nextProduct },
      req.params.id
    );

    if (referenceError) {
      return res.status(referenceError.status).json({
        success: false,
        message: referenceError.message,
      });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    }).populate(reviewPopulate);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const currentReview = await Review.findById(req.params.id);

    if (!currentReview) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Review not found",
      });
    }

    if (!isAdmin(req) && !isOwnedByUser(currentReview, req.user.id)) {
      return forbiddenResponse(res);
    }

    const review = await Review.findByIdAndDelete(req.params.id).populate(reviewPopulate);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Review deleted successfully",
      data: review,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
