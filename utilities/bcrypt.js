import bcrypt from "bcrypt";
import crypto from "crypto";

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const hashPassword = (password) => bcrypt.hashSync(password, salt);

const comparePassword = (hashedPassword, password) =>
  bcrypt.compareSync(password, hashedPassword);

const generateResetToken = () => {
  let resetToken = crypto.randomBytes(32).toString("hex");
  let hashedToken = bcrypt.hashSync(resetToken, salt);
  return { resetToken, hashedToken };
};

export { hashPassword, comparePassword, generateResetToken };
