import {
  errorResponse,
  successResponse,
  successResponseArray,
} from "../utilities/responses.js";

import { createItem, getItem, getItems } from "../database/query/helper.js";

export default class TagController {
  static async getTags(req, res) {
    try {
      const { error, result: tags } = await getItems("tags");
      if (error) {
        return errorResponse(res, 500, "Server error");
      }

      return successResponseArray(res, 200, tags);
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }
}
