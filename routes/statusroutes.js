import express from "express";
import {
  createStatus,
  deleteStatus,
  getAllStatuses,
  getSingleUsersStatus,
} from "../controllers/status.js";
import { upload } from "../utilities/statusMulter.js";

const router = express.Router();
router.post("/create/:userId", upload.single("image"), createStatus);
router.get("/getstatus", getAllStatuses);
router.get("/userstatus/:userId", getSingleUsersStatus);
router.delete("/delete", deleteStatus);
export default router;
