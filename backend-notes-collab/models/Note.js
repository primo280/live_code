const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["read", "edit"],
          default: "read",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Note", noteSchema)
