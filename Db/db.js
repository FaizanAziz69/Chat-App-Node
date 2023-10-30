import mongoose from "mongoose";
import dotenv from "dotenv"; // Import dotenv

// Load environment variables from .env
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI; // Access the MONGODB_URI variable from .env
    const connect = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database Connected at ${connect.connection.host}`);
  } catch (error) {
    console.error("Database connection error", error);
    process.exit(1);
  }
};

export default connectDB;
