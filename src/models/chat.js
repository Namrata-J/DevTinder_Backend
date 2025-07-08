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

chatSchema.index({ participants: 1 }, { unique: true });

const Chat = mongoose.model("chats", chatSchema);
Chat.init();

module.exports = { Chat };