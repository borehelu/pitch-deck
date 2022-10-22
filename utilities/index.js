import jwt from "./jwt.js";
import * as bcrypt from "./bcrypt.js";
import {
  errorResponse,
  successResponse,
  successResponseArray,
} from "./responses.js";

const { generateToken, verifyToken } = jwt;
const { hashPassword, comparePassword } = bcrypt;

export {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  errorResponse,
  successResponse,
  successResponseArray,
};
