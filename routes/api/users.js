import express from "express";
import { UserController } from "../../controllers/index.js";

const router = express.Router();

const { registerUser, getUsers, loginUser } = UserController;

router.post("/create-user", registerUser);

router.get("/users", getUsers);

router.post("/login", loginUser);

export default router;
