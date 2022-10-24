import express from "express";
import { IdeaController } from "../../controllers/index.js";
import { Authenticate, validate } from "../../middlewares/index.js";

const router = express.Router();
const {
  getIdeas,
  createIdea,
  removeIdea,
  editIdea,
  getIdea,
  commentIdea,
  editComment,
  removeComment
} = IdeaController;

const { verifyToken } = Authenticate;

// create idea
router.post("/ideas", validate("createIdea"), verifyToken, createIdea);

// get ideas
router.get("/ideas",verifyToken,  getIdeas);

// get idea
router.get("/ideas/:id",  getIdea);

// remove idea
router.delete("/ideas/:id", verifyToken, removeIdea);

// update idea
router.patch("/ideas/:id", validate("createIdea"), verifyToken, editIdea);

// comment idea
router.post(
  "/ideas/:id/comment",
  validate("comment"),
  verifyToken,
  commentIdea
);

// comment idea
router.patch(
  "/ideas/:id/comment/:commentId",
  validate("comment"),
  verifyToken,
  editComment
);

// comment idea
router.delete(
    "/ideas/:id/comment/:commentId",
    validate("comment"),
    verifyToken,
    removeComment
  );

export default router;
