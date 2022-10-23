import {
    errorResponse,
    successResponse,
    successResponseArray,
  } from "../utilities/responses.js";
  
  import {
    createItem,
    deleteItem,
    getItem,
    getItems,
    updateItem
  } from "../database/query/helper.js";
  
  import jwt from "../utilities/jwt.js";
  
  const { decodeToken } = jwt;
  
  export default class IdeaController {
    
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
  
    static async createTag(req, res) {
      const { name, description } = req.body;
  
      try {
        const { result } = await getItem("tags", { name });
        if (result.length > 0) {
          return errorResponse(res, 409, "Tag already exists");
        }
        const { error: createError, result: newTag } = await createItem("tags", {
          name,
          description,
        });
        if (createError) {
          throw new Error(createError);
        }
  
        successResponse(res, 201, "Tag created succesfully", newTag);
      } catch (error) {
        return errorResponse(res, 500, "Server error");
      }
    }
  
    static async removeTag(req, res) {
      try {
        // const { userId } = decodeToken(req.headers.authorization);
        const { id: tagId } = req.params;
  
        const { result: tagItem } = await getItem("tags", { id: tagId });
  
        if (!tagItem.length > 0) return errorResponse(res, 404, "Tag not found");
        // if (tagId.ownerId !== userId) {
        //   return errorResponse(res, 403, 'Not allowed');
        // }
  
        const { result: deleted } = await deleteItem("tags", tagId);
        if (deleted) return successResponse(res, 200, "Tag succesfully deleted");
        return errorResponse(res, 500, "Server error deleting tag");
      } catch (error) {
        return errorResponse(res, 500, "Internal server error");
      }
    }
  
    static async editTag(req, res) {
      const { name, description } = req.body;
      const { id: tagId } = req.params;
  
      try {
        const { result: tagItem } = await getItem("tags", {
          id: tagId,
        });
        if (!tagItem.length > 0) return errorResponse(res, 404, "Not found");
  
        const { error, result: existingTag } = await updateItem("tags", tagId, {
          name: name || tagItem.name,
          description: description || tagItem.description,
        });
  
        if (!error) {
          return successResponse(
            res,
            201,
            "Tag succesfully updated",
            existingTag
          );
        }
        return errorResponse(res, 500, "Server error");
      } catch (error) {
        console.log(error);
        return errorResponse(res, 500, "Internal server error");
      }
    }
  }
  