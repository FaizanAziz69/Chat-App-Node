import mongoose from "mongoose";

// Define the schema for the UserModel
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // User's username (required and unique)
    unique: true,
  },
  password: {
    type: String,
    required: true, // User's password (required)
  },
  image: {
    type: String,
    maxlength: 5000, // URL to the user's profile image (maximum length of 5000 characters)
  },
  statuses: [
    {
      statusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status", // References the 'Status' model
      },
      username: {
        type: String, // Username associated with the status
      },
      image: {
        type: String, // Image associated with the status
      },
    },
  ],
});

// Create the UserModel model based on the schema
const UserModel = mongoose.model("UserModel", userSchema);

export default UserModel;