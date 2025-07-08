const mongoose = require("mongoose");
const { Schema } = mongoose;

const messagesSchema = new Schema(
  {
    chat: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "chats",
    },
    sender: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "users",
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("messages", messagesSchema);
Messages.init();

module.exports = { Messages };