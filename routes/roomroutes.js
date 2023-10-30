import {
  createRoom,
  getRoomByName,
  getAllRoom,
  joinRoom,
  deleteMessage,
  updateRoom,
  deleteRoom,
} from "../controllers/room.js";
import express from "express";
import { upload } from "../utilities/roomMulter.js";

const app = express.Router();

app.post("/createRoom", upload.single("image"), createRoom);
app.post("/join", joinRoom);
app.get("/allroom", getAllRoom);
app.get("/singleroom/:roomName", getRoomByName);
app.delete("/deletemessage", deleteMessage);
app.put("/rooms/:roomId", upload.single("image"), updateRoom);
app.delete("/deleteroom/:roomId", deleteRoom);

export default app;
