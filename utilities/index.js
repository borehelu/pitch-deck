import jwt from "./jwt.js";
import * as bcrypt from "./bcrypt.js";
import {
  errorResponse,
  successResponse,
  successResponseArray,
} from "./responses.js";

import { sendEmail } from "./email.js";
import getCurrentDate from "./date.js";

const { generateToken, verifyToken } = jwt;
const { hashPassword, comparePassword, generateResetToken } = bcrypt;

export {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateResetToken,
  errorResponse,
  successResponse,
  successResponseArray,
  getCurrentDate,
  sendEmail
};
