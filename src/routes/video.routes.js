import { Router } from "express";

import { publishAVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/publishVideo").post(
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1,
        },
        {
            name: "Video",
            maxCount: 1
        }
    ]),
    publishAVideo
);

export default router;