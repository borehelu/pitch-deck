import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "dotenv";
import apiRoutes from "./routes/index.js";

config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", apiRoutes);

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("add_idea", (data) => {
    socket.emit("new_idea", data);
  });

  socket.on("upvote_idea", (data) => {
    socket.emit("new_idea", data);
  });
});

server.listen(5000, () => {
  console.log("listening");
});
