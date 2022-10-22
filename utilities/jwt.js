import { config } from "dotenv";
import jwt from "jsonwebtoken";

config();

const secretKey = process.env.JWT_SECRET_KEY;

export default class Jwt {
  static async generateToken(payload, secret = secretKey) {
    const token = await jwt.sign(payload, secret, { expiresIn: "1d" });
    return token;
  }

  static async verifyToken(token, secret = secretKey) {
    const decoded = await jwt.verify(token, secret);
    return decoded;
  }
}
