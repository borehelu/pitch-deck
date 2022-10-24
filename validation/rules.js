import { body } from "express-validator";

const nameRegex = /^[A-Za-z\-']{2,250}$/;

export const userRegister = [
  body("firstName")
    .matches(nameRegex)
    .trim()
    .withMessage(
      "First name should be an alphabet between 2 and 250 characters"
    ),
  body("lastName")
    .matches(nameRegex)
    .trim()
    .withMessage(
      "Last name should be an alphabet between 2 and 250 characters"
    ),
  body("password", "Password should be at least 6 characters").isLength({
    min: 6,
  }),
  body("email", "Please provide a valid email")
    .isEmail()
    .isLength({ min: 3, max: 250 })
    .trim(),
];

export const loginUser = [
  body("email")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Provide your Email")
    .trim(),
  body("password")
    .not()
    .isEmpty()
    .isString()
    .withMessage("Provide your password")
    .trim(),
];

export const createIdea = [
  body("title")
    .not()
    .isEmpty()
    .isString()
    .withMessage("Provide a title for idea")
    .trim(),
  body("description")
    .not()
    .isEmpty()
    .isString()
    .withMessage("Provide a description for idea")
    .trim(),
];

export const createTag = [
  body("name")
    .not()
    .isEmpty()
    .isString()
    .withMessage("Provide a title for tag")
    .trim(),
  body("description")
    .not()
    .isEmpty()
    .isString()
    .withMessage("Provide a description for tag")
    .trim(),
];

export const comment = [
  body("comment")
    .not()
    .isEmpty()
    .isString()
    .withMessage("Provide your comment")
    .trim(),
];

export const reply = [
  body("reply")
    .not()
    .isEmpty()
    .isString()
    .withMessage("Provide your reply")
    .trim(),
];
