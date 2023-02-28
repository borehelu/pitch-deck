import express from "express";
import { IdeaController } from "../../controllers/index.js";
import { Authenticate, validate } from "../../middlewares/index.js";

const router = express.Router();
const {
  getIdeas,
  postIdea,
  removeIdea,
  editIdea,
  getIdea,
  commentIdea,
  editComment,
  removeComment,
  getComments,
  replyToComment,
  editReply,
  removeReply,
  getReplies,
  upvoteIdea,
} = IdeaController;

const { verifyToken } = Authenticate;

// create idea
router.post("/ideas", validate("createIdea"), verifyToken, postIdea);

// get ideas
router.get("/ideas", verifyToken, getIdeas);

// get idea
router.get("/ideas/:id", getIdea);

router.patch("/ideas/:id/upvote", upvoteIdea);

// remove idea
router.delete("/ideas/:id", verifyToken, removeIdea);

// update idea
router.patch("/ideas/:id", validate("createIdea"), verifyToken, editIdea);

// comment idea
router.post(
  "/ideas/:id/comments",
  validate("comment"),
  verifyToken,
  commentIdea
);

// view idea
router.get("/ideas/:id/comments", verifyToken, getComments);

// comment idea
router.patch(
  "/ideas/:id/comments/:commentId",
  validate("comment"),
  verifyToken,
  editComment
);

// comment idea
router.delete("/ideas/:id/comments/:commentId", verifyToken, removeComment);

// comment idea
router.post(
  "/ideas/:id/comments/:commentId/replies",
  validate("reply"),
  verifyToken,
  replyToComment
);

// view idea
router.get("/ideas/:id/comments/:commentId/replies", verifyToken, getReplies);

// comment idea
router.patch(
  "/ideas/:id/comments/:commentId/replies/:replyId",
  validate("reply"),
  verifyToken,
  editReply
);

// comment idea
router.delete(
  "/ideas/:id/comments/:commentId/replies/:replyId",
  verifyToken,
  removeReply
);

export default router;
