import express from "express";
import { IdeaController } from "../../controllers/index.js";
import { Authenticate, validate } from "../../middlewares/index.js";

const router = express.Router();
const { getIdeas, createIdea, removeIdea, editIdea, getIdea, commentIdea } = IdeaController;
const { verifyToken } = Authenticate;

// create idea
router.post("/ideas", validate("createIdea"), verifyToken, createIdea);

// get ideas
router.get("/ideas", verifyToken, getIdeas);

// get idea
router.get("/ideas/:id", verifyToken, getIdea);

// remove idea
router.delete("/ideas/:id", verifyToken, removeIdea);

// update idea
router.patch("/ideas/:id", validate("createIdea"), verifyToken, editIdea);

// comment idea
router.post('/ideas/:id/comment', validate('comment'), verifyToken, commentIdea);


export default router;
