import { validationResult } from "express-validator";
import validationFetch from "../validation/index.js";

export default (validationName) => {
  const rules = validationFetch(validationName);
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      const resErrorMsg = {};
      errors.array().forEach((error) => {
        resErrorMsg[error.param] = error.msg;
      });
      if (errors.isEmpty()) {
        next();
      } else {
        res.status(422).json({ errors: resErrorMsg });
      }
    },
  ];
};
