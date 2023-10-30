import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  errorMessages,
  successMessages,
} from "../utilities/ErrorandSuccess.js";

// Load the BASE_URL from environment variables
const BASE_URL = process.env.BASE_URL;

// Controller function for user registration
export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const usernameCheck = await UserModel.findOne({ username });

    if (usernameCheck) {
      return res.json({ msg: errorMessages.usernameTaken, status: false });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    let imageUrl = "";

    // Check if a profile image is uploaded and generate its URL
    if (req.file) {
      const { filename } = req.file;
      imageUrl = `${BASE_URL}/userimages/${filename}`;
    }

    // Create a new user
    const user = await UserModel.create({
      username,
      password: hashedPassword,
      image: imageUrl,
    });

    return res.json({ msg: successMessages.registrationSuccess });
  } catch (err) {
    return res.status(500).json({message:error.message})
  }
};

// Controller function to get all users
export const getAllUsers = async (req, res) => {
  try {
    // Retrieve all users from the database
    const allUsers = await UserModel.find();
    res.json(allUsers);
  } catch (err) {
    return res.status(500).json({message:error.message})
  }
};

// Controller function for user login
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find the user by their username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.json({ msg: errorMessages.userNotFound, status: false });
    }

    // Check if the provided password matches the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.json({ msg: errorMessages.invalidPassword, status: false });
    }

    // Create a JWT token for the user
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    return res.json({
      msg: successMessages.loginSuccess,
      status: true,
      user,
      token,
    });
  } catch (err) {
    return res.status(500).json({message:error.message})
  }
};

// Controller function to delete a user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.find(userId);

    if (!user) {
      return res.status(200).json({ message: errorMessages.userNotFound });
    }

    // Delete the user from the database
    const deleteUser = await UserModel.deleteOne(user);
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
};
