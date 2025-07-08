const express = require("express");
const chatRouter = express.Router();
const { Messages } = require("../models/messages");
const authMiddleware = require("../middlewares/auth");
const { getChatRoomId } = require("../services/socket");
const { ConnectionRequest } = require("../models/connectionRequest");

chatRouter.get("/retrieve/:receiverId", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req?.user;
    const { receiverId } = req?.params;
    const senderId = loggedInUser?._id?.toString();

    // check if loggedInUser is connected with the receiver
    const areConnected = await ConnectionRequest.areConnected({
      userId1: senderId,
      userId2: receiverId,
    });

    if (!areConnected) {
      return res
        .status(403)
        .json({ message: "You are not connected with this user." });
    }

    // get the chat id for the participants
    const chatId = await getChatRoomId(senderId, receiverId);

    // if chatId is not found, return an error
    if (!chatId) {
      return res.status(404).json({ message: "Chat room does not exist" });
    }

    // retrieve the chat messages
    const chatMessages = await Messages.find({ chat: chatId }).sort({
      createdAt: 1,
    });

    // modify messages
    const messages = chatMessages.map((message) => {
      const dateObj = new Date(message?.createdAt);
      const date = dateObj.toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const time = dateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        messageId: message?._id,
        message: message?.message,
        senderId: message?.sender,
        date,
        time,
      };
    });

    res.send({
      message: "Messages fetched succesfully",
      data: messages,
    });
  } catch (err) {
    console.error("ERROR while trying to retrieve chats" + err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = chatRouter;
