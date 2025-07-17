const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://sync-flow-prathmesh-pimpalshendes-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {

      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin: " + origin));
      }
    },
    credentials: true,
  })
);


// ✅ Must parse JSON after CORS
app.use(express.json());

// ✅ Socket.IO CORS config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ✅ Socket.IO Auth
io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("No token. Disconnecting:", socket.id);
    return socket.disconnect();
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Socket authenticated:", userId);
    socket.userId = userId;
  } catch (err) {
    console.error("Invalid token:", err.message);
    socket.emit("auth_error", "Invalid token");
    return socket.disconnect();
  }

  socket.on("task-updated", (data) => {
    console.log("📡 Broadcasting task update:", data);
    socket.broadcast.emit("task-updated", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});


app.set("io", io);


app.get("/ping", (_, res) => res.send("pong"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/logs", require("./routes/logs"));

//  MongoDB and Server Init
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(` Server running on http://localhost:${PORT}`)
    );
  })
  .catch(console.error);
