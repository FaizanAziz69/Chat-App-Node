import mongoose from "mongoose";

// Define the schema for the Status model
const statusSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false, 
  },
  media: {
    type: String, // Media URL, could be an image or video
  },
  type: {
    type: String,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel", // Reference to the User model, linking statuses to users
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default timestamp for status creation
  },
});

// Create the Status model based on the schema
const StatusModel = mongoose.model("Status", statusSchema);

export default StatusModel;
