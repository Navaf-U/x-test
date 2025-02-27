import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import Message from "./models/dmModel.js";
import Notification from "./models/notificationModel.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

configDotenv();

export const userSocketMap = {};
export const app = express();
export const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const user = jwt.verify(token, process.env.JWT_TOKEN);
    socket.handshake.auth.user = user.id;
    socket.data.userId = user.id;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.data.userId;

  console.log(`User connected: ${userId}`);

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}`);
    delete userSocketMap[userId];
  });

  socket.on("joinRoom", ({ chatId }) => {
    socket.join(chatId);
    console.log(`User ${userId} joined room: ${chatId}`);
  });

  socket.on("sendDm", async (data) => {
    try {
      const message = await Message.create({
        sender: userId,
        receiver: data.receiverId,
        content: data.content,
      });

      const notification = await Notification.create({
        acceptor: data.receiverId,
        sender: userId,
        type: "message",
      });

      io.to(data.chatId).emit("receiveDm", message);
      io.to(userSocketMap[userId]).emit("newNotification", notification);
    } catch (error) {
      console.log("Error occurred during sending DM:", error);
    }
  });

  socket.on("follow", async (data) => {
    try {
      const notification = await Notification.create({
        acceptor: data.followingId,
        sender: userId,
        type: "follow",
      });
      if (userSocketMap[data.followingId]) {
        io.to(userSocketMap[data.followingId]).emit("newNotification", notification);
      }
    } catch (error) {
      console.log("Error occurred during notifications:", error);
    }
  });
});

console.log("Socket.IO server is running! 🚀");

// Now the frontend's "joinRoom" event will work perfectly! Let me know if anything else needs tweaking. ✌️