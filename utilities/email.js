import nodemailer from "nodemailer";
import { config } from "dotenv";
import hbs from "nodemailer-express-handlebars";
import path from "path";

config();

export const sendEmail = async (email, subject, lastName, token, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // point to the template folder
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };

    // use a template file with nodemailer
    transporter.use("compile", hbs(handlebarOptions));

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: subject,
      template: "email",
      context: {
        lastName: lastName,
        token: token,
        userId: userId,
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
