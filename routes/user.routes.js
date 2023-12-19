import Router from "express";
import registerUser from "../controllers/user.controller.js";
import multer from "multer";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avtar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
