import Router from "express";
import {Loginuser, Logoutuser, refreshAccessToken, registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js";
import { vetifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avtar", maxCount: 1},
        {name: "coverImage", maxCount: 1},
    ]),
    registerUser
);
router.route("/login").post(Loginuser);
router.route("/logout").post(vetifyjwt,Logoutuser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
