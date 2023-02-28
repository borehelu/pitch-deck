import {
  errorResponse,
  successResponse,
  successResponseArray,
  hashPassword,
  generateToken,
  sendEmail,
  generateResetToken,
  comparePassword,
} from "../utilities/index.js";
import {
  createItem,
  getItem,
  getItems,
  updateItem,
} from "../database/query/helper.js";

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
    const { firstName, lastName, email, password, userRole, avatar } = req.body;

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
          avatar,
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

      if (user.length > 0) {
        const { id, firstName, lastName, password: userPassword,avatar } = user[0];
        const confirmPassword = comparePassword(userPassword, password);
        if (!confirmPassword) {
          return errorResponse(res, 401, "Authorization failed");
        }

        const token = await generateToken({ userId: id, firstName, lastName });
        const data = { user:{userId: id, firstName, lastName,avatar}, token };
        return successResponse(res, 200, "success", data);
      }
      return errorResponse(res, 401, "Authorization failed");
    } catch (error) {
      return errorResponse(res, 500, "Server error");
    }
  }

  static async sendPasswordResetLink(req, res) {
    const { email } = req.body;

    try {
      const { result: user } = await getItem("users", { email });

      if (user.length > 0) {
        const { id, lastName } = user[0];
        const { resetToken, hashedToken } = generateResetToken();

        const { error, result: existingUser } = await updateItem("users", id, {
          token: hashedToken,
        });

        const subject = "Password reset";

        console.log(email, subject, lastName, resetToken, id);

        let mailIsSent = await sendEmail(
          email,
          subject,
          lastName,
          resetToken,
          id
        );

        if (mailIsSent) {
          return successResponse(res, 200, "Reset link sent successfuly");
        } else {
          console.log("error i s");
          return errorResponse(res, 500, "Server error");
        }
      }
      return errorResponse(res, 401, "Email does not exist");
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Server error");
    }
  }

  static async resetPassword(req, res) {
    const { password, userId: id } = req.body;
    const { token } = req.params;

    try {
      const { result: userItem } = await getItem("users", { id });

      const [user] = userItem;

      const isValid = comparePassword(user.token, token);

      if (!isValid) {
        return errorResponse(res, 401, "Authorization failed");
      }

      const { error, result: existingUser } = await updateItem(
        "users",
        user.id,
        {
          password: hashPassword(password),
        }
      );

      if (!error) {
        return successResponse(res, 200, "Password reset successfuly");
      }
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Server error");
    }
  }
}
