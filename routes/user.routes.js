import Router from "express";
import {
    Loginuser,
    Logoutuser,
    changeCurrentPassowrd,
    getCurrentUser,
    getUserChannelProfiel,
    getWatchHistory,
    refreshAccessToken,
    registerUser,
    updateAccountdetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js";
import {vetifyjwt} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avtar", maxCount: 1},
        {name: "coverImage", maxCount: 1},
    ]),
    registerUser
);
router.route("/login").post(Loginuser);
router.route("/logout").post(vetifyjwt, Logoutuser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/changed-password").post(vetifyjwt, changeCurrentPassowrd);
router.route("/curren-user").get(vetifyjwt, getCurrentUser);
router.route("/update-account").patch(vetifyjwt, updateAccountdetails);
router
    .route("/avtar")
    .patch(vetifyjwt, upload.single("avtar"), updateUserAvatar);
router
    .route("/coverimage")
    .patch(vetifyjwt, upload.single("/coverimgage"), updateUserCoverImage);
router.route("/c/:username").get(vetifyjwt, getUserChannelProfiel);
router.route("/watchHistory").get(vetifyjwt, getWatchHistory);
export default router;
