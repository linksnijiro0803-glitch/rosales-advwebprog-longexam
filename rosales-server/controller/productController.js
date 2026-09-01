const mongoose = require("mongoose");
const { HttpStatus } = require("../config/constants");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Supplier = require("../models/supplierModel");

const productPopulate = [
  { path: "category", select: "categoryName" },
  { path: "seller", select: "firstName lastName email username" },
  { path: "supplier", select: "supplierName contactPerson email contactNumber" },
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Duplicate product data is not allowed",
      count: 0,
      data: null,
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message,
      count: 0,
      data: null,
    });
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Server error",
    count: 0,
    data: null,
    error: error.message,
  });
};

const validateProductReferences = async (body) => {
  if (body.category !== undefined && body.category !== null) {
    if (!isValidObjectId(body.category)) {
      return { status: HttpStatus.BAD_REQUEST, message: "Invalid category ID" };
    }

    const categoryExists = await Category.exists({ _id: body.category });
    if (!categoryExists) {
      return { status: HttpStatus.NOT_FOUND, message: "Category not found" };
    }
  }

  if (body.seller !== undefined && body.seller !== null) {
    if (!isValidObjectId(body.seller)) {
      return { status: HttpStatus.BAD_REQUEST, message: "Invalid seller ID" };
    }

    const sellerExists = await User.exists({ _id: body.seller });
    if (!sellerExists) {
      return { status: HttpStatus.NOT_FOUND, message: "Seller user not found" };
    }
  }

  if (body.supplier !== undefined && body.supplier !== null && body.supplier !== "") {
    if (!isValidObjectId(body.supplier)) {
      return { status: HttpStatus.BAD_REQUEST, message: "Invalid supplier ID" };
    }

    const supplierExists = await Supplier.exists({ _id: body.supplier });
    if (!supplierExists) {
      return { status: HttpStatus.NOT_FOUND, message: "Supplier not found" };
    }
  }

  return null;
};

const createProduct = async (req, res) => {
  try {
    const body = {
      ...req.body,
      seller: req.user.id,
    };

    const referenceError = await validateProductReferences(body);
    if (referenceError) {
      return res.status(referenceError.status).json({
        success: false,
        message: referenceError.message,
        count: 0,
        data: null,
      });
    }

    const product = await Product.create(body);
    await product.populate(productPopulate);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Product created successfully",
      count: 1,
      data: product,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;
    const filter = {};
    const sort = req.query.sort || "-createdAt";

    if (req.query.category) {
      if (!isValidObjectId(req.query.category)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid category ID",
          count: 0,
          data: null,
        });
      }

      filter.category = req.query.category;
    }

    if (req.query.supplier) {
      if (!isValidObjectId(req.query.supplier)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid supplier ID",
          count: 0,
          data: null,
        });
      }

      filter.supplier = req.query.supplier;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(escapeRegex(req.query.search), "i");

      filter.$or = [
        { productName: searchRegex },
        { description: searchRegex },
      ];
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate(productPopulate)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Products retrieved successfully.",
      count,
      data: products,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getProductById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid product ID",
        count: 0,
        data: null,
      });
    }

    const product = await Product.findById(req.params.id).populate(productPopulate);

    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Product not found",
        count: 0,
        data: null,
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Product retrieved successfully",
      count: 1,
      data: product,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid product ID",
        count: 0,
        data: null,
      });
    }

    const referenceError = await validateProductReferences(req.body);
    if (referenceError) {
      return res.status(referenceError.status).json({
        success: false,
        message: referenceError.message,
        count: 0,
        data: null,
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(productPopulate);

    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Product not found",
        count: 0,
        data: null,
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Product updated successfully",
      count: 1,
      data: product,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid product ID",
        count: 0,
        data: null,
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id).populate(productPopulate);

    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Product not found",
        count: 0,
        data: null,
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Product deleted successfully",
      count: 1,
      data: product,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
