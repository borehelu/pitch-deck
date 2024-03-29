import express from "express";
import { TagController } from "../../controllers/index.js";
import { Authenticate, validate } from "../../middlewares/index.js";

const router = express.Router();
const { getTags, createTag, removeTag, editTag, getTag } = TagController;
const { verifyToken } = Authenticate;

// create tags
router.post("/tags", verifyToken, createTag);

// get tags
router.get("/tags", verifyToken, getTags);


// get tags
router.get("/tags/:id", verifyToken, getTag);

// remove tags
router.delete("/tags/:id", verifyToken, removeTag);

// update tags
router.patch("/tags/:id", validate("createTag"), verifyToken, editTag);

export default router;
