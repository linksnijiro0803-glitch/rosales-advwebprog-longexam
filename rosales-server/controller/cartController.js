const mongoose = require("mongoose");
const { HttpStatus } = require("../config/constants");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const cartPopulate = [
  { path: "user", select: "-password" },
  { path: "items.product" },
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isAdmin = (req) => req.user?.role === "Admin";

const isOwnedByUser = (doc, userId) => doc?.user?._id?.toString?.() === userId || doc?.user?.toString?.() === userId;

const getCartTotal = (items = []) =>
  items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);

const forbiddenResponse = (res) =>
  res.status(HttpStatus.FORBIDDEN).json({
    success: false,
    message: "Access denied",
  });

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Only one cart is allowed per user",
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

const getProductIdsFromItems = (items) => {
  if (items === undefined) {
    return { productIds: [] };
  }

  if (!Array.isArray(items)) {
    return { error: "Items must be an array" };
  }

  const productIds = [];

  for (const item of items) {
    if (!item.product || !isValidObjectId(item.product)) {
      return { error: "Each cart item must contain a valid product ID" };
    }

    productIds.push(item.product.toString());
  }

  return { productIds: [...new Set(productIds)] };
};

const validateCartReferences = async (body, cartId = null) => {
  if (body.user !== undefined && body.user !== null) {
    if (!isValidObjectId(body.user)) {
      return { status: HttpStatus.BAD_REQUEST, message: "Invalid user ID" };
    }

    const userExists = await User.exists({ _id: body.user });
    if (!userExists) {
      return { status: HttpStatus.NOT_FOUND, message: "User not found" };
    }

    const duplicateFilter = { user: body.user };
    if (cartId) {
      duplicateFilter._id = { $ne: cartId };
    }

    const existingCart = await Cart.findOne(duplicateFilter);
    if (existingCart) {
      return { status: HttpStatus.BAD_REQUEST, message: "Only one cart is allowed per user" };
    }
  }

  const { productIds, error } = getProductIdsFromItems(body.items);
  if (error) {
    return { status: HttpStatus.BAD_REQUEST, message: error };
  }

  if (productIds.length > 0) {
    const productsFound = await Product.countDocuments({ _id: { $in: productIds } });
    if (productsFound !== productIds.length) {
      return { status: HttpStatus.NOT_FOUND, message: "One or more products were not found" };
    }
  }

  return null;
};

const createCart = async (req, res) => {
  try {
    const body = {
      ...req.body,
      user: isAdmin(req) && req.body.user ? req.body.user : req.user.id,
    };
    if (body.items !== undefined) {
      body.totalAmount = getCartTotal(body.items);
    }

    const referenceError = await validateCartReferences(body);
    if (referenceError) {
      return res.status(referenceError.status).json({
        success: false,
        message: referenceError.message,
      });
    }

    const cart = await Cart.create(body);
    await cart.populate(cartPopulate);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Cart created successfully",
      data: cart,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getCarts = async (req, res) => {
  try {
    const filter = isAdmin(req) ? {} : { user: req.user.id };
    const carts = await Cart.find(filter).populate(cartPopulate).sort({ createdAt: -1 });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Carts retrieved successfully",
      data: carts,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getCartById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid cart ID",
      });
    }

    const cart = await Cart.findById(req.params.id).populate(cartPopulate);

    if (!cart) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Cart not found",
      });
    }

    if (!isAdmin(req) && !isOwnedByUser(cart, req.user.id)) {
      return forbiddenResponse(res);
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateCart = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid cart ID",
      });
    }

    const currentCart = await Cart.findById(req.params.id);

    if (!currentCart) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Cart not found",
      });
    }

    if (!isAdmin(req) && !isOwnedByUser(currentCart, req.user.id)) {
      return forbiddenResponse(res);
    }

    const body = {
      ...req.body,
      user: isAdmin(req) && req.body.user ? req.body.user : currentCart.user,
    };
    if (body.items !== undefined) {
      body.totalAmount = getCartTotal(body.items);
    }

    const referenceError = await validateCartReferences(body, req.params.id);
    if (referenceError) {
      return res.status(referenceError.status).json({
        success: false,
        message: referenceError.message,
      });
    }

    const cart = await Cart.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    }).populate(cartPopulate);

    if (!cart) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Cart not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteCart = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid cart ID",
      });
    }

    const currentCart = await Cart.findById(req.params.id);

    if (!currentCart) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Cart not found",
      });
    }

    if (!isAdmin(req) && !isOwnedByUser(currentCart, req.user.id)) {
      return forbiddenResponse(res);
    }

    const cart = await Cart.findByIdAndDelete(req.params.id).populate(cartPopulate);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Cart deleted successfully",
      data: cart,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createCart,
  getCarts,
  getCartById,
  updateCart,
  deleteCart,
};
