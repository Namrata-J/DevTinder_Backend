const crypto = require("crypto");
const socket = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { Chat } = require("../models/chat");
const { Messages } = require("../models/messages");
const { ConnectionRequest } = require("../models/connectionRequest");

const getChatRoomId = async (senderId, receiverId) => {
  let chatId = "";

  // check if the chat room for participants already exists
  const existingChat = await Chat.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!existingChat) {
    // create a new chat room if it doesn't exist
    const newChat = new Chat({
      participants: [senderId, receiverId],
    });
    const chat = await newChat.save();
    chatId = chat._id.toString();
  } else {
    chatId = existingChat._id.toString();
  }

  return chatId;
};

const initSocket = (httpServer) => {
  console.log("Initializing Socket.IO...");

  const io = socket(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://13.201.6.106"], // Allow all origins for simplicity; adjust as needed
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket?.handshake?.auth?.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
      const { _id } = decodedToken;
      const user = await User.findById(_id);

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      console.log("Socket authentication error:", err);
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", async ({ receiverId }) => {
      const senderId = socket.user._id.toString();

      // check if sender is connected to the receiver i.e. if sender is eligible to initiate a chat with the receiver
      const areConnected = await ConnectionRequest.areConnected({
        userId1: senderId,
        userId2: receiverId,
      });

      if (!areConnected) {
        return socket.emit("chat_error", {
          message: "You are not connected with this user.",
        });
      }

      // get the chat room id for the sender and receiver
      const chatId = await getChatRoomId(senderId, receiverId);
      if (!chatId) {
        return socket.emit("chat_error", {
          message: "Chat room could not be created.",
        });
      }

      // join the chat room
      socket.join(chatId);
    });

    socket.on(
      "sendMessage",
      async ({ receiverId, senderMessage }) => {
        const senderId = socket.user._id.toString();

        // check if sender is connected to the receiver i.e. if sender is eligible to initiate a chat with the receiver
        const areConnected = await ConnectionRequest.areConnected({
          userId1: senderId,
          userId2: receiverId,
        });

        if (!areConnected) {
          return socket.emit("chat_error", {
            message: "You are not connected with this user.",
          });
        }

        // get the chat room id for the sender and receiver
        const chatId = await getChatRoomId(senderId, receiverId);

        if (!chatId) {
          return socket.emit("chat_error", {
            message: "Chat room could not be created.",
          });
        }

        // Save the message to the database
        const newMessage = new Messages({
          chat: chatId,
          sender: senderId,
          message: senderMessage,
        }); 

        const message = await newMessage.save();

        if (!message) {
          return socket.emit("chat_error", {
            message: "Message could not be sent.",
          });
        }

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

        // Emit the message to the chat room
        io.to(chatId).emit("receiveMessage", {
          messageId: message?._id,
          message: message?.message,
          senderId: message?.sender,
          date,
          time
        });
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = { initSocket, getChatRoomId };
