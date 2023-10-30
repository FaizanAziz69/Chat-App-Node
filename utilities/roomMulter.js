import multer from "multer";

const storage = multer.diskStorage({
  destination: "./room",
  filename: (req, file, cb) => {
    // Generate a unique filename for each uploaded file
    const uniqueFilename = `${req.body.name}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

export const upload = multer({
  storage: storage,
});