const mongoose = require("mongoose");
const { HttpStatus } = require("../config/constants");
const Supplier = require("../models/supplierModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Supplier already exists",
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

const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Suppliers retrieved successfully",
      data: suppliers,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getSupplierById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Supplier retrieved successfully",
      data: supplier,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateSupplier = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteSupplier = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Supplier deleted successfully",
      data: supplier,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
