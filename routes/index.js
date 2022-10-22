import express from "express";
import userRoute from "./api/users.js";
import tagsRoute from "./api/tags.js";

const router = express.Router();

router.use("/auth", userRoute);
router.use(tagsRoute);

export default router;
