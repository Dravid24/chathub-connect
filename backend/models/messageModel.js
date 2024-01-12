const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, Ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, Ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageModel);

exports.module = Message;
