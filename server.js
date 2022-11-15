import express from "express";
import cors from "cors";
import { config } from "dotenv";
import apiRoutes from "./routes/index.js";

config();
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", apiRoutes);

app.listen(5000, () => {
  console.log("listening");
});
