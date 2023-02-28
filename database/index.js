import mysql from "mysql";
import { config } from "dotenv";

config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.log(err)
    throw err;
  }
  console.log("connected to database");
});

export default connection;
