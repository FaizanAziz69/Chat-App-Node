import mongoose from "mongoose";

// Define the schema for the Room model
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // The name of the room (required and unique)m
  },
  image: {
    type: String, // URL to an image for the room, can be empty
  },
  messages: {
    type: Array, // An array to store messages, with timestamps
    timestamps: true,
  },
  description: {
    type: String, // A description for the room, can be empty
  },
});

// Create the Room model based on the schema
const Room = mongoose.model("Room", roomSchema);

export default Room;
