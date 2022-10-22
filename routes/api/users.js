import express from "express";
import { UserController } from "../../controllers/index.js";

const router = express.Router();

const { registerUser } = UserController;

router.post("/create-user", registerUser);

router.get("/users", (req, res) => {
  res.json({ message: "get user" });
});

router.post("/signin", (req, res) => {
  res.json({ message: "login user" });
});

export default router;
