const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    paragraph: { type: String, required: true },
    preview: { type: String, required: true },
    status: {
      type: String,
      enum: ["published", "draft", "disabled"],
      default: "published",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Article || mongoose.model("Article", articleSchema);
