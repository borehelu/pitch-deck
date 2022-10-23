import express from "express";
import { IdeaController } from "../../controllers/index.js";
import { Authenticate, validate } from "../../middlewares/index.js";

const router = express.Router();
const { getIdeas, createIdea, removeIdea, editIdea, getIdea } = IdeaController;
const { verifyToken } = Authenticate;

// create tags
router.post("/tags", verifyToken, createTag);

// get tags
router.get("/tags", verifyToken, getTags);

// remove tags
router.delete("/tags/:id", verifyToken, removeTag);

// update tags
router.patch("/tags/:id", validate("createTag"), verifyToken, editTag);

export default router;
