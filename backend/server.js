const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./router/userRouters");
const chatRoutes = require("./router/chatRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

const app = express();
dotenv.config();
connectDB();

app.use(cors());

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

//-----deployment
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname1, "frontend", "dist");
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API running successfully");
  });
}
//---------deployment

app.use(notFound);
app.use(errorHandler);

app.listen(5000, console.log("Server started on Port 5000"));
