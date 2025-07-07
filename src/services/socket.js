const crypto = require("crypto");
const socket = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const hashedRoomId = (senderId, receiverId) => {
  const roomId = [senderId, receiverId].sort().join("-");
  const hashedRoomId = crypto.createHash("sha256").update(roomId).digest("hex");
  return hashedRoomId;
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
    socket.on("joinChat", ({ senderId, receiverId }) => {
      const roomId = hashedRoomId(senderId, receiverId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      ({ senderId, receiverId, senderMessage, senderFirstName }) => {
        const roomId = hashedRoomId(senderId, receiverId);
        io.to(roomId).emit("receiveMessage", {
          senderId,
          senderFirstName,
          senderMessage,
        });
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = { initSocket };
