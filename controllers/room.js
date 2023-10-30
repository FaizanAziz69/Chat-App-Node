import Room from "../models/rooms.js";
import UserModel from "../models/user.js";
import { errorMessages, successMessages } from "../utilities/ErrorandSuccess.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get IP and Port from environment variables
const serverIP = process.env.SERVER_IP || "localhost";
const serverPort = process.env.SERVER_PORT || 5000;

// Construct the base URL
const baseURL = `http://${serverIP}:${serverPort}`;

// Controller function to create a new chat room
export const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(401).json({ message: errorMessages.roomAlreadyExists });
    }

    let imageUrl;

    if (req.file) {
      const { filename } = req.file;
      imageUrl = `${baseURL}/room/${filename}`;
    }

    const newRoom = new Room({
      name,
      image: imageUrl,
      description,
    });

    const savedRoom = await newRoom.save();

    res.status(201).json({ message: successMessages.roomCreatedSuccess, room: savedRoom });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:error.message})
  }
};
// Controller function to join a chat room
export const joinRoom = async (req, res) => {
  try {
    // Extract room ID, user ID, and username from the request body
    const { roomId, userId, userName } = req.body;

    // Find the room and user in the database
    const room = await Room.findById(roomId);
    const user = await UserModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.json({ message: errorMessages.userDoesNotExist });
    }

    // Check if the user is already in the room
    const userExists = room.users.some((user) => user.userId.toString() === userId);

    if (userExists) {
      return res.json({ message: errorMessages.userAlreadyInRoom });
    }

    // Check if the username already exists in the room
    const userNameExists = room.users.some((user) => user.name === userName);

    if (userNameExists) {
      return res.json({ message: errorMessages.usernameAlreadyExists, status: false });
    }

    // Add the user to the room's list of users and save
    room.users.push({ userId, name: userName });

    const updatedRoom = await room.save();

    res.json(updatedRoom);
  } catch (err) {
    return res.status(500).json({message:error.message})
  }
};

// Controller function to get a list of all chat rooms
export const getAllRoom = async (req, res) => {
  try {
    // Retrieve all rooms from the database
    const getrooms = await Room.find();
    res.json(getrooms);
  } catch (err) {
    res.json(err);
  }
};

// Controller function to get a chat room by name
export const getRoomByName = async (req, res) => {
  try {
    // Extract the room name from the request parameters
    const { roomName } = req.params;

    // Find the room in the database by name
    const room = await Room.findOne({ name: roomName });

    if (!room) {
      return res.json({ message: errorMessages.roomNotFound });
    }

    res.json(room);
  } catch (err) {
    return res.status(500).json({message:error.message})
  }
};

// Controller function to delete a chat message in a room
export const deleteMessage = async (req, res) => {
  // Extract room ID and message ID from the request body
  const { roomId, messageId } = req.body;

  try {
    // Find the room by ID
    const roomData = await Room.findOne({ _id: roomId });

    if (!roomData) {
      return res.status(404).json({ message: errorMessages.roomNotFound });
    }

    // Find and remove the message from the room's messages
    const messageToDelete = roomData.messages.find((msg) => String(msg._id) === String(messageId));

    if (!messageToDelete) {
      return res.status(404).json({ message: errorMessages.messageNotFound });
    }

    roomData.messages = roomData.messages.filter(
      (msg) => String(msg._id) !== String(messageId)
    );

    await roomData.save();

    return res.status(200).json({ message: successMessages.messageDeletedSuccess });
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
};

// Controller function to update a chat room
export const updateRoom = async (req, res) => {
  try {
    // Extract room ID from request parameters and room name and description from the body
    const { roomId } = req.params;
    const { name, description } = req.body;

    // Find the room by ID
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: errorMessages.roomNotFound });
    }

    // Check if a room with the same name already exists
    const existingRoom = await Room.findOne({ name });

    if (existingRoom && existingRoom._id !== roomId) {
      return res.status(401).json({ message: errorMessages.roomAlreadyExists });
    }

    let imageUrl = room.image;

    // If a file is uploaded, generate an image URL
    if (req.file) {
      const { filename } = req.file;
      imageUrl = `${baseURL}/uploads/${filename}`;
    }

    // Update the room's information
    room.name = name;
    room.image = imageUrl;
    room.description = description;

    const updatedRoom = await room.save();

    res.status(200).json({ message: successMessages.roomUpdateSuccess, room: updatedRoom });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:error.message})
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const deletedRoom = await Room.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return res.status(404).json({ message: errorMessages.roomNotFound });
    }

    res.status(200).json({ message: successMessages.roomDeletedSuccess, room: deletedRoom });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:error.message})
  }
};
