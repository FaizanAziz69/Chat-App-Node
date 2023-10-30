import UserModel from "../models/user.js";
import StatusModel from "../models/status.js";
import { CronJob } from "cron";
import {
  errorMessages,
  successMessages,
} from "../utilities/ErrorandSuccess.js";

// Load the BASE_URL from environment variables
const BASE_URL = process.env.BASE_URL;

// Controller function to create a new status
export const createStatus = async (req, res) => {
  try {
    const { text, type } = req.body;
    const { userId } = req.params;

    // Find the user by their ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: errorMessages.userNotFound });
    }

    let mediaUrl = "";

    // Check if a media file (image or video) was uploaded and generate its URL
    if (req.file) {
      if (req.file.mimetype.startsWith("image")) {
        mediaUrl = `${BASE_URL}/status/images/${req.file.filename}`;
      } else if (req.file.mimetype.startsWith("video")) {
        mediaUrl = `${BASE_URL}/status/videos/${req.file.filename}`;
      }
    }

    // Create a new status instance
    const newStatus = new StatusModel({
      text,
      media: mediaUrl,
      type,
      userId: user._id,
    });

    // Save the new status
    const savedStatus = await newStatus.save();

    // Add the status to the user's list of statuses
    user.statuses.push({
      statusId: savedStatus._id,
      username: user.username,
      image: mediaUrl,
    });

    // Save the user's updated statuses
    await user.save();

    return res
      .status(201)
      .json({
        message: successMessages.statusCreatedSuccess,
        status: savedStatus,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:error.message})
  }
};

// Controller function to get all statuses of all users
export const getAllStatuses = async (req, res) => {
  try {
    // Find all users
    const users = await UserModel.find();
    const allStatuses = [];

    for (const user of users) {
      // Find statuses of each user and populate the user information
      const statuses = await StatusModel.find({ userId: user._id }).populate(
        "userId",
        "username"
      );
      allStatuses.push({
        user: user.username,
        image: user.image,
        statuses: statuses.map((status) => ({
          statusId: status._id,
          username: status.userId.username,
          text: status.text,
          mediaUrl: status.media,
        })),
      });
    }

    return res.status(200).json({ allStatuses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:error.message})
  }
};

// Controller function to get statuses of a single user
export const getSingleUsersStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by their ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: errorMessages.userNotFound });
    }

    // Find statuses of the user
    const userStatuses = await StatusModel.find({ userId: user._id });

    return res.status(200).json({ statuses: userStatuses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:error.message})
  }
};

// Controller function to delete a user's status
export const deleteStatus = async (req, res) => {
  try {
    const { userId, statusId } = req.body;

    // Find the user by their ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: errorMessages.userNotFound });
    }

    // Find and delete the status by its ID
    const status = await StatusModel.findByIdAndDelete(statusId);
    if (!status) {
      return res.status(404).json({ message: errorMessages.statusNotFound });
    }

    // Remove the status from the user's list of statuses
    user.statuses = user.statuses.filter(
      (s) => s.statusId.toString() !== statusId
    );

    // Save the user's updated statuses
    await user.save();

    return res
      .status(200)
      .json({ message: successMessages.statusDeletedSuccess });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:error.message})
  }
};
// Function to delete expired statuses using a cron job
const deleteExpiredStatuses = async () => {
  try {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago

    // Find and delete statuses that have expired
    const expiredStatuses = await StatusModel.find({
      createdAt: { $lt: expirationDate },
    });

    await Promise.all(
      expiredStatuses.map(async (status) => {
        await StatusModel.deleteOne({ _id: status._id });

        // Update the user's statuses
        const user = await UserModel.findById(status.userId);
        if (user) {
          user.statuses = user.statuses.filter(
            (s) => s.statusId.toString() !== status._id.toString()
          );
          await UserModel.findByIdAndUpdate(
            user._id,
            { statuses: user.statuses },
            { new: true }
          );
          console.log(`Status ${status._id} removed from user ${user._id}`);
        }
      })
    );


  } catch (error) {
    return res.status(500).json({message:error.message})
  }
};

// Create a CronJob to run the deleteExpiredStatuses function periodically (e.g., every 1 hour)
const deleteExpiredStatusesJob = new CronJob(
  "0 */1 * * *",
  deleteExpiredStatuses
);
deleteExpiredStatusesJob.start();
