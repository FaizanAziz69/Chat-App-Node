import multer from "multer";

// Define the storage configuration for Multer
const storage = multer.diskStorage({
  // Specify the destination where uploaded files will be stored
  destination: "./userimages",

  // Define the filename of the uploaded file
  filename: (req, file, cb) => {
    // Generate a unique filename for each uploaded file
    const uniqueFilename = `${req.body.username}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

// Create a Multer instance with the specified storage configuration
export const upload = multer({
  storage: storage,
});