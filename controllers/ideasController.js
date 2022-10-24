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
  updateItem,
} from "../database/query/helper.js";

import jwt from "../utilities/jwt.js";
import { getCurrentDate } from "../utilities/index.js";

const { decodeToken } = jwt;

export default class IdeaController {
  static async getIdeas(req, res) {
    try {
      const { error, result: ideas } = await getItems("ideas");
      if (error) {
        return errorResponse(res, 500, "Server error");
      }

      return successResponseArray(res, 200, ideas);
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }

  static async getIdea(req, res) {
    try {
      const { id: ideaId } = req.params;
      const { error, result: idea } = await getItem("ideas", { id: ideaId });

      if (!idea.length > 0) return errorResponse(res, 404, "Idea not found");

      const { result: commentArr } = await getItem("comments", {
        ideaId: ideaId,
      });
      if (error) {
        return errorResponse(res, 500, "Server error");
      }

      const [currentIdea] = idea;

      const response = { ...currentIdea, comments: commentArr };

      return successResponseArray(res, 200, response);
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }

  static async createIdea(req, res) {
    const { title, description } = req.body;

    try {
      const { userId } = await decodeToken(req.headers.authorization);
      const { error: createError, result: newIdea } = await createItem(
        "ideas",
        {
          title,
          description,
          userId,
          createdAt: getCurrentDate(),
          upvotes: 0,
          modifiedAt: getCurrentDate(),
        }
      );
      if (createError) {
        throw new Error(createError);
      }

      successResponse(res, 201, "Idea created succesfully", newIdea);
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Server error");
    }
  }

  static async removeIdea(req, res) {
    try {
      const { userId } = decodeToken(req.headers.authorization);
      const { id: ideaId } = req.params;

      const { result: ideaItem } = await getItem("ideas", { id: ideaId });

      if (!ideaItem.length > 0)
        return errorResponse(res, 404, "Idea not found");
      if (ideaItem.userId !== userId) {
        return errorResponse(res, 403, "Not allowed");
      }

      const { result: deleted } = await deleteItem("ideas", ideaId);
      if (deleted) return successResponse(res, 200, "Idea succesfully deleted");
      return errorResponse(res, 500, "Server error deleting idea");
    } catch (error) {
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async editIdea(req, res) {
    const { title, description } = req.body;
    const { id: ideaId } = req.params;

    try {
      const { result: ideaItem } = await getItem("ideas", {
        id: ideaId,
      });
      if (!ideaItem.length > 0) return errorResponse(res, 404, "Not found");

      const { error, result: existingIdea } = await updateItem(
        "ideas",
        ideaId,
        {
          title: title || ideaItem.title,
          description: description || ideaItem.description,
          modifiedAt: getCurrentDate(),
        }
      );

      if (!error) {
        return successResponse(
          res,
          201,
          "Idea succesfully updated",
          existingIdea
        );
      }
      console.log(error);
      return errorResponse(res, 500, "Server error");
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async commentIdea(req, res) {
    const { comment } = req.body;
    const { id: ideaId } = req.params;
    const { userId } = await decodeToken(req.headers.authorization);

    try {
      const { result: idea } = await getItem("ideas", { id: ideaId });
      if (!idea.length > 0) {
        return errorResponse(res, 500, "Idea not found");
      }
      const { error, result: newComment } = await createItem("comments", {
        comment,
        ideaId,
        userId,
        createdAt: getCurrentDate(),
        modifiedAt: getCurrentDate(),
      });

      const response = {
        ...newComment,
        ideaTitle: idea.title,
        ideaDescription: idea.description,
      };

      if (!error) {
        return successResponse(
          res,
          201,
          "Comment succesfully created",
          response
        );
      }
      throw new Error(error);
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async getComments(req, res) {
    try {
      const { id: ideaId } = req.params;
      const { error, result: idea } = await getItem("ideas", { id: ideaId });

      if (!idea.length > 0) return errorResponse(res, 404, "Idea not found");

      const { result: commentArr } = await getItem("comments", {
        ideaId: ideaId,
      });
      if (error) {
        return errorResponse(res, 500, "Server error");
      }

      const response = { comments: commentArr };

      return successResponseArray(res, 200, response);
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }

  static async editComment(req, res) {
    const { comment } = req.body;
    const { id: ideaId, commentId } = req.params;
    const { userId } = await decodeToken(req.headers.authorization);

    try {
      const { result: ideaItem } = await getItem("ideas", {
        id: ideaId,
      });
      if (!ideaItem.length > 0) return errorResponse(res, 404, "Not found");

      const { result: commentItem } = await getItem("comments", {
        id: commentId,
      });
      if (!commentItem.length > 0) return errorResponse(res, 404, "Not found");

      if (!userId === commentItem.userId)
        return errorResponse(res, 403, "Not allowed");
      const { error, result: existingComment } = await updateItem(
        "comments",
        commentId,
        {
          comment: comment || commentItem.comment,
          modifiedAt: getCurrentDate(),
        }
      );

      if (!error) {
        return successResponse(
          res,
          201,
          "Comment succesfully updated",
          existingComment
        );
      }

      return errorResponse(res, 500, "Server error");
    } catch (error) {
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async removeComment(req, res) {
    try {
      const { userId } = await decodeToken(req.headers.authorization);
      const { id: ideaId, commentId } = req.params;

      const { result: ideaItem } = await getItem("ideas", { id: ideaId });

      if (!ideaItem.length > 0)
        return errorResponse(res, 404, "Idea not found");
      const { result: commentItem } = await getItem("comments", {
        id: commentId,
      });
      if (!commentItem.length > 0)
        return errorResponse(res, 404, "Comment not found");
      if (!userId === commentItem.userId)
        return errorResponse(res, 403, "Not allowed");

      const { result: deleted } = await deleteItem("comments", commentId);
      if (deleted)
        return successResponse(res, 200, "Comment succesfully deleted");
      return errorResponse(res, 500, "Server error deleting comment");
    } catch (error) {
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async replyToComment(req, res) {
    const { reply } = req.body;
    const { id: ideaId, commentId } = req.params;
    const { userId } = await decodeToken(req.headers.authorization);

    try {
      const { result: idea } = await getItem("ideas", { id: ideaId });
      if (!idea.length > 0) {
        return errorResponse(res, 500, "Idea not found");
      }
      const { result: commentItem } = await getItem("comments", {
        id: commentId,
      });
      if (!commentItem.length > 0)
        return errorResponse(res, 404, "Comment not found");

      const { error, result: newReply } = await createItem("replies", {
        reply,
        commentId,
        userId,
        createdAt: getCurrentDate(),
        modifiedAt: getCurrentDate(),
      });

      const response = {
        newReply,
      };

      if (!error) {
        return successResponse(res, 201, "Reply succesfully created", response);
      }
      throw new Error(error);
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async removeReply(req, res) {
    try {
      const { userId } = await decodeToken(req.headers.authorization);
      const { id: ideaId, commentId, replyId } = req.params;

      const { result: ideaItem } = await getItem("ideas", { id: ideaId });

      if (!ideaItem.length > 0)
        return errorResponse(res, 404, "Idea not found");
      const { result: commentItem } = await getItem("comments", {
        id: commentId,
      });
      if (!commentItem.length > 0)
        return errorResponse(res, 404, "Comment not found");
      const { result: replyItem } = await getItem("replies", {
        id: replyId,
      });
      if (!replyItem.length > 0)
        return errorResponse(res, 404, "Reply not found");

      if (!userId === replyItem.userId)
        return errorResponse(res, 403, "Not allowed");

      const { result: deleted } = await deleteItem("replies", replyId);
      if (deleted)
        return successResponse(res, 200, "Reply succesfully deleted");
      return errorResponse(res, 500, "Server error deleting comment");
    } catch (error) {
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async editReply(req, res) {
    const { reply } = req.body;
    const { id: ideaId, commentId, replyId } = req.params;
    const { userId } = await decodeToken(req.headers.authorization);

    try {
      const { result: ideaItem } = await getItem("ideas", {
        id: ideaId,
      });
      if (!ideaItem.length > 0) return errorResponse(res, 404, "Not found");

      const { result: commentItem } = await getItem("comments", {
        id: commentId,
      });
      if (!commentItem.length > 0) return errorResponse(res, 404, "Not found");

      const { result: replyItem } = await getItem("replies", {
        id: replyId,
      });
      if (!replyItem.length > 0) return errorResponse(res, 404, "Not found");

      if (!userId === replyItem.userId)
        return errorResponse(res, 403, "Not allowed");
      const { error, result: existingReply } = await updateItem(
        "replies",
        replyId,
        {
          reply: reply || replyItem.reply,
          modifiedAt: getCurrentDate(),
        }
      );

      if (!error) {
        return successResponse(
          res,
          201,
          "Reply succesfully updated",
          existingReply
        );
      }

      return errorResponse(res, 500, "Server error");
    } catch (error) {
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async getReplies(req, res) {
    try {
      const { id: ideaId, commentId } = req.params;
      const { error, result: idea } = await getItem("ideas", { id: ideaId });

      if (!idea.length > 0) return errorResponse(res, 404, "Idea not found");

      const { result: commentItem } = await getItem("comments", {
        id: commentId,
      });

      if (!commentItem.length > 0)
        return errorResponse(res, 404, "Comment not found");

      const { result: repliesArr } = await getItem("replies", {
        commentId: commentId,
      });
      if (error) {
        return errorResponse(res, 500, "Server error");
      }

      const response = { replies: repliesArr };

      return successResponseArray(res, 200, response);
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }
}
