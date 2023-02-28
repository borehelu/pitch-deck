import { verifyToken, errorResponse } from "../utilities/index.js";
import { getItem } from "../database/query/helper.js";

class Authenticate {
  static async verifyAdmin(req, res, next) {
    const { user } = req;
    try {
      const { error: ignored, result: foundUser } = await getItem("users", {
        id: user.userId,
      });
      if (foundUser.userRole === "admin") {
        return next();
      }
      return errorResponse(res, 401, "Access denied, only admins");
    } catch (error) {
      return errorResponse(res, 401, "Access denied. We could not verify user");
    }
  }

  static async verifyToken(req, res, next) {
    try {
      const {
        headers: { authorization },
      } = req;
      if (authorization === undefined) throw new Error("no auth");
      const token = authorization;

      if (!token || token === "") {
        return errorResponse(res, 401, "Access denied");
      }

      const decoded = await verifyToken(token);

      if (!(decoded && decoded.userId)) {
        return errorResponse(
          res,
          401,
          "Access denied. We could not verify user"
        );
      }
      req.user = decoded;
      return next();
    } catch (error) {
      if (error.message === "no auth" || error.message === "jwt expired") {
        console.log(error)
        return errorResponse(res, 401, "Authorisation failed");
      }
      return errorResponse(res, 500, "Server error");
    }
  }

  static async verifyRootUser(req, res, next) {
    const { secret } = req.body;
    const savedSecret = process.env.ROOT_USER;
    if (secret === savedSecret) {
      req.body.userRole = "admin";
      return next();
    }
    return errorResponse(res, 403, "Not allowed");
  }
}

export default Authenticate;
