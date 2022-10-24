import express from "express";
import userRoute from "./api/users.js";
import tagsRoute from "./api/tags.js";
import ideasRoute from './api/ideas.js'

const router = express.Router();

router.use("/auth", userRoute);
router.use(tagsRoute);
router.use(ideasRoute);


export default router;
