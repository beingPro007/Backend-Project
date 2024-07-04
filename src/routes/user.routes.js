import { Router } from "express";
import {
    changeCurrPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCoun: 1,
        },
    ]),

    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt, changeCurrPassword);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/updateAccountDetails").patch(verifyJwt, updateAccountDetails);
router
    .route("/updateUserAvatar")
    .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
router
    .route("/cover-image")
    .patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:username").get(verifyJwt, getUserChannelProfile);
router.route("/History").get(verifyJwt, getWatchHistory);

export default router;
