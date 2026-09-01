const mongoose = require("mongoose");
const { HttpStatus } = require("../config/constants");
const Category = require("../models/categoryModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Category already exists",
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

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getCategoryById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateCategory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
