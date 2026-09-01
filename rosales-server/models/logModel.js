const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      required: [true, "Log level is required"],
    },

    message: {
      type: String,
      required: [true, "Log message is required"],
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Log || mongoose.model("Log", logSchema);
