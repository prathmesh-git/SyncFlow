const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require("jsonwebtoken");

dotenv.config();


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("❌ No token provided. Disconnecting:", socket.id);
      return socket.disconnect();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🟢 Socket authenticated:", decoded.userId);
    socket.userId = decoded.userId;

    // Real-time broadcast handlers
    socket.on("task-updated", (data) => {
      console.log("📡 Broadcasting task update:", data);
      socket.broadcast.emit("task-updated", data);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.id);
    });

  } catch (err) {
    console.error("❌ Socket auth error:", err.message);
    socket.emit("auth_error", "Invalid token");
    socket.disconnect();
  }
});
// expose io to routes
app.set("io", io);

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/logs', require('./routes/logs'));


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(5000, () => console.log("Server running on http://localhost:5000"));
  })
  .catch(err => console.error(err));
