const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    participants: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "users",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("chats", chatSchema);
Chat.init();

module.exports = { Chat };