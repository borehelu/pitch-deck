import { userRegister, loginUser, createIdea, comment, createTag, reply } from './rules.js';

export const validationFetch = (validationName) => {
  const rules = {
    userRegister,
    loginUser,
    createIdea,
    comment,
    createTag,
    reply
  };

  return rules[validationName];
};

export default validationFetch;