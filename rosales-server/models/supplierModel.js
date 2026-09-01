const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: [true, "Supplier name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Supplier name must contain at least 2 characters"],
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
    },

    contactPerson: {
      type: String,
      trim: true,
      maxlength: [100, "Contact person cannot exceed 100 characters"],
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    contactNumber: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Supplier ||
  mongoose.model("Supplier", supplierSchema);
