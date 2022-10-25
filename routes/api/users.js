import express from "express";
import { UserController } from "../../controllers/index.js";
import { Authenticate, validate } from "../../middlewares/index.js";

const router = express.Router();

const {
  registerUser,
  getUsers,
  loginUser,
  sendPasswordResetLink,
  resetPassword,
} = UserController;
const { verifyToken } = Authenticate;

router.post("/create-user", validate("userRegister"), registerUser);

router.get("/users", verifyToken, getUsers);

router.post("/login", loginUser);

router.post("/password-reset", validate("passwordLink"), sendPasswordResetLink);

router.post("/password-reset/:token", validate("passwordReset"), resetPassword);

export default router;
