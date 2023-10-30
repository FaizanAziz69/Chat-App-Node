import UserModel from "../models/user.js";
import multer from "multer";

// Define the storage configuration for Multer
const storage = multer.diskStorage({
  // Specify the destination where uploaded files will be stored (in this case, the "./status" directory)
  destination: "./status",

  // Define the filename of the uploaded file asynchronously
  filename: async (req, file, cb) => {
    try {
      const { userId } = req.params;

      // Find the user based on the provided user ID
      const user = await UserModel.findById(userId);

      // Extract the username from the user object, or set it to "unknown" if the user is not found
      const username = user ? user.username : "unknown";

      // Generate a unique filename for the uploaded file based on the username and the original filename
      const uniqueFilename = `${username}-${file.originalname}`;
      cb(null, uniqueFilename);
    } catch (error) {
      console.error(error);

      // Pass the error to the callback function
      cb(error);
    }
  },
});

// Create a Multer instance with the specified storage configuration
export const upload = multer({
  storage: storage,
});