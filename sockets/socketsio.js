import { Server } from "socket.io";
import Room from "../models/rooms.js";
import mongoose from "mongoose"; // Import the mongoose module

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle user joining a room
    socket.on("join", (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    // Handle room creation request
    socket.on("createRoomRequest", () => {
      console.log("Room creation requested");
      socket.emit("createRoomSuccess", { msg: "Room created" });
    });

    // Handle sending a message
    socket.on("send", async (data) => {
      const { room, message, username, repliedTo, userimg } = data;
      console.log(data, "..here is data");

      console.log(`Message received in room ${room}: ${message}:${username}`);
      const roomData = await Room.findOne({ name: room });

      if (roomData) {
        const messageId = new mongoose.Types.ObjectId();
        const newMessage = {
          _id: messageId,
          message,
          username,
          repliedTo,
          userimg,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };

        roomData.messages.push(newMessage);

        await roomData.save();
        io.to(room).emit("receive", { ...newMessage });
      }
    });

    // Handle editing a message
    socket.on("editMsgReq", async (data) => {
      const { room, message, msgid } = data;

      const roomData = await Room.findOne({ name: room });

      const messages = roomData.messages;

      let editedmsg;

      roomData.messages = messages.map((msg) => {
        if (msgid == msg._id) {
          console.log("msg found");
          editedmsg = { ...msg, message: message };
          return { ...msg, message: message };
        } else {
          return msg;
        }
      });

      await roomData.save();
      io.to(room).emit("message edit successfully", editedmsg);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

export default initializeSocket;
