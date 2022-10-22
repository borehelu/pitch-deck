import {
  errorResponse,
  successResponse,
  successResponseArray,
  hashPassword,
  generateToken,
} from "../utilities/index.js";
import { createItem, getItem, getItems } from "../database/query/helper.js";
import { comparePassword } from "../utilities/bcrypt.js";

export default class UserController {
  static async getUsers(req, res) {
    try {
      const { error, result: users } = await getItems("users");
      if (error) {
        return errorResponse(res, 500, "Server error");
      }
      const deletePasswords = users.map((user) => {
        delete user.password;
        return user;
      });
      return successResponseArray(res, 200, deletePasswords);
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }

  static async registerUser(req, res) {
    const { firstName, lastName, email, password, userRole } = req.body;
    console.log(firstName, lastName, password, email, userRole);
    // verify if user exists
    try {
      const { result } = await getItem("users", { email });
      if (result.length > 0) {
        return errorResponse(res, 409, "User already exists");
      }
      const { error: createError, result: newUser } = await createItem(
        "users",
        {
          firstName,
          lastName,
          password: password ? hashPassword(password) : undefined,
          email,
          userRole: userRole ? userRole.toLowerCase() : "user",
        }
      );
      if (createError) {
        console.log("Error creating user", createError);
        throw new Error(createError);
      }

      const { password: ignored, ...rest } = newUser;

      const token = await generateToken({
        userId: rest.id,
        firstName,
        lastName,
      });
      const response = {
        ...rest,
        userId: rest.id,
        token,
      };
      successResponse(res, 201, "User account created succesfully", response);
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }

  static async loginUser(req, res) {
    const { email, password } = req.body;

    try {
      const { result: user } = await getItem("users", { email });

      if (user) {
        const { id, firstName, lastName, password: userPassword } = user[0];

        const confirmPassword = comparePassword(userPassword, password);
        if (!confirmPassword) {
          return errorResponse(res, 401, "Authorization failed");
        }

        const token = await generateToken({ userId: id, firstName, lastName });

        const data = { userId: id, token };

        return successResponse(res, 200, "success", data);
      }
      return errorResponse(res, 401, "Authorization failed");
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }
}
