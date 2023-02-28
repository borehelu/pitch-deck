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
  getIdeasDb,
  getCommentsDb,
  updateItem,
  getItemCondition,
  deleteItemCondition,
  updateTags,
} from "../database/query/helper.js";

import jwt from "../utilities/jwt.js";
import { getCurrentDate } from "../utilities/index.js";
import { createIdea, fetchIdeas } from "../models/Ideas.js";

const { decodeToken } = jwt;

export default class IdeaController {
  static async postIdea(req, res) {
    const { userId } = await decodeToken(req.headers.authorization);
    try {
      const data = await createIdea({ ...req.body, userId });
      return successResponseArray(res, 201, data);
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Server error");
    }
  }

  static async getIdeas(req, res) {
    try {
      const { userId } = await decodeToken(req.headers.authorization);
      const ideas = await fetchIdeas(userId);
      return successResponseArray(res, 200, ideas);
    } catch (error) {
      console.log(error.message);
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

  static async removeIdea(req, res) {
    try {
      const { userId } = await decodeToken(req.headers.authorization);
      const { id: ideaId } = req.params;

      const { result: ideaItem } = await getItem("ideas", { id: ideaId });

      if (!ideaItem.length > 0)
        return errorResponse(res, 404, "Idea not found");
      if (ideaItem[0].userId !== userId) {
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
    const { title, description, tags } = req.body;
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

      if (existingIdea) {
        updateTags(ideaId, tags)
          .then((result) => {
            console.log(result);
            return successResponse(
              res,
              201,
              "Idea succesfully updated",
              existingIdea
            );
          })
          .catch((er) => console.log(er));
      }
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Internal server error");
    }
  }

  static async upvoteIdea(req, res) {
    const { id: ideaId } = req.params;
    const { userId } = await decodeToken(req.headers.authorization);
    let newUpvotes;

    try {
      const { result: ideaItem } = await getItem("ideas", {
        id: ideaId,
      });
      if (!ideaItem.length > 0) return errorResponse(res, 404, "Not found");

      const { result: upvotes } = await getItemCondition("upvotes", {
        ideaId: ideaId,
        userId: userId,
      });

      if (upvotes.length > 0) {
        newUpvotes = ideaItem[0].upvotes - 1;
        newUpvotes = newUpvotes < 0 ? 0 : newUpvotes;
        const { error, result: upvotes } = await deleteItemCondition(
          "upvotes",
          {
            ideaId: ideaId,
            userId: userId,
          }
        );
        if (error) {
          throw new Error(error);
        }
      } else {
        newUpvotes = ideaItem[0].upvotes + 1;
        const { error: createError, result: upvotes } = await createItem(
          "upvotes",
          {
            ideaId,
            userId,
          }
        );
        if (createError) {
          throw new Error(createError);
        }
      }
      const { error, result: existingIdea } = await updateItem(
        "ideas",
        ideaId,
        {
          upvotes: newUpvotes,
          modifiedAt: getCurrentDate(),
        }
      );

      if (!error) {
        return successResponse(
          res,
          201,
          "Idea succesfully upvoted",
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

      if (!error) {
        return successResponse(
          res,
          201,
          "Comment succesfully created",
          newComment
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

      const { result: commentArr } = await getCommentsDb(ideaId);
      if (error) {
        return errorResponse(res, 500, "Server error");
      }

      const comments = commentArr.map((comment) => {
        return {
          id: comment.id,
          comment: comment.comment,
          author: {
            userId: comment.userId,
            firstName: comment.firstName,
            lastName: comment.lastName,
            avatar: comment.avatar,
          },
          createdAt: comment.createdAt,
          modifiedAt: comment.modifiedAt,
        };
      });

      const response = { comments };

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
          "Comment successfully updated",
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
        return successResponse(res, 200, "Comment successfully deleted");
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
        return successResponse(res, 201, "Reply successfully created", response);
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
