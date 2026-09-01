const mongoose = require("mongoose");
const { HttpStatus } = require("../config/constants");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const orderPopulate = [
  { path: "user", select: "-password" },
  { path: "items.product" },
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
      message: "Duplicate order data is not allowed",
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
      return { error: "Each order item must contain a valid product ID" };
    }

    productIds.push(item.product.toString());
  }

  return { productIds: [...new Set(productIds)] };
};

const validateOrderReferences = async (body) => {
  if (body.user !== undefined && body.user !== null) {
    if (!isValidObjectId(body.user)) {
      return { status: HttpStatus.BAD_REQUEST, message: "Invalid user ID" };
    }

    const userExists = await User.exists({ _id: body.user });
    if (!userExists) {
      return { status: HttpStatus.NOT_FOUND, message: "User not found" };
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

const createOrder = async (req, res) => {
  try {
    const body = {
      ...req.body,
      user: isAdmin(req) && req.body.user ? req.body.user : req.user.id,
    };

    const referenceError = await validateOrderReferences(body);
    if (referenceError) {
      return res.status(referenceError.status).json({
        success: false,
        message: referenceError.message,
      });
    }

    const order = await Order.create(body);
    await order.populate(orderPopulate);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getOrders = async (req, res) => {
  try {
    const filter = isAdmin(req) ? {} : { user: req.user.id };
    const orders = await Order.find(filter).populate(orderPopulate).sort({ createdAt: -1 });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id).populate(orderPopulate);

    if (!order) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!isAdmin(req) && !isOwnedByUser(order, req.user.id)) {
      return forbiddenResponse(res);
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const currentOrder = await Order.findById(req.params.id);

    if (!currentOrder) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!isAdmin(req) && !isOwnedByUser(currentOrder, req.user.id)) {
      return forbiddenResponse(res);
    }

    const body = {
      ...req.body,
      user: isAdmin(req) && req.body.user ? req.body.user : currentOrder.user,
    };

    const referenceError = await validateOrderReferences(body);
    if (referenceError) {
      return res.status(referenceError.status).json({
        success: false,
        message: referenceError.message,
      });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    }).populate(orderPopulate);

    if (!order) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const currentOrder = await Order.findById(req.params.id);

    if (!currentOrder) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!isAdmin(req) && !isOwnedByUser(currentOrder, req.user.id)) {
      return forbiddenResponse(res);
    }

    const order = await Order.findByIdAndDelete(req.params.id).populate(orderPopulate);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Order deleted successfully",
      data: order,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
