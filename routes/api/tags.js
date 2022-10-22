import express from "express";
import { TagController } from "../../controllers/index.js";

const router = express.Router();
const { getTags } = TagController;

// create tags
router.post("/tags", (req, res) => {
  res.json({ message: "create user" });
});

// get tags
router.get("/tags",getTags);

// remove tags
router.delete("/tags/:id", (req, res) => {
  res.json({ message: "login user" });
});

// update tags

router.patch("/tags/:id", (req, res) => {
  res.json({ message: "login user" });
});

export default router;
