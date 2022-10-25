import {
  userRegister,
  loginUser,
  createIdea,
  comment,
  createTag,
  reply,
  passwordLink,
  passwordReset,
} from "./rules.js";

export const validationFetch = (validationName) => {
  const rules = {
    userRegister,
    loginUser,
    createIdea,
    comment,
    createTag,
    reply,
    passwordLink,
    passwordReset,
  };

  return rules[validationName];
};

export default validationFetch;
