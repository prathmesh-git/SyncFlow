const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Task = require("../models/Tasks");
const Log  = require("../models/Log");
const User = require("../models/User");
const authenticateUser = require("../middlewares/auth");

router.use(authenticateUser);

const emitTaskUpdate = async (app, taskId) => {
  const io   = app.get("io");
  const task = await Task.findById(taskId).populate("assignedTo");
  io.emit("task-updated", task);
};

const emitTaskDelete = (app, taskId) => {
  app.get("io").emit("task-deleted", taskId);
};

const emitLog = async (app, logId) => {
  const io = app.get("io");
  const log = await Log.findById(logId).populate("userId taskId");
  io.emit("log-created", log);
};

router.get("/", async (_req, res) => {
  const tasks = await Task.find().populate("assignedTo");
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const { title, description, assignedTo, status, priority } = req.body;
  const invalidTitles = ["Todo", "In Progress", "Done"];

  try {
    if (invalidTitles.includes(title.trim())) {
      return res.status(400).json({ error: "Task title cannot match column names." });
    }

    const existing = await Task.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({ error: "Task title already exists." });
    }

    const task = await Task.create({ title, description, assignedTo, status, priority });

    
    const log = await Log.create({
      action: "created",
      taskId: task._id,
      userId: req.user.id,
    });

    await emitTaskUpdate(req.app, task._id);
    await emitLog(req.app, log._id); 

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  let { updatedAt, _id, __v, ...updates } = req.body;

  try {
    console.log("📥 Incoming update payload:", req.body);

    const existing = await Task.findById(id);
    if (!existing) return res.status(404).json({ error: "Task not found" });

    // ✅ FIXED: Check conflict using existing.updatedAt
    if (
      updatedAt &&
      new Date(updatedAt).toISOString() !== new Date(existing.updatedAt).toISOString()
    ) {
      return res.status(409).json({ conflict: true, serverData: existing });
    }

    const { title } = updates;
    const invalidTitles = ["Todo", "In Progress", "Done"];

    // ✅ Validate title doesn't match column names
    if (title && invalidTitles.includes(title.trim())) {
      return res.status(400).json({ error: "Task title cannot match column names." });
    }

    // ✅ Check for uniqueness
    if (title) {
      const duplicate = await Task.findOne({ title: title.trim() });
      if (duplicate && duplicate._id.toString() !== id) {
        return res.status(400).json({ error: "Task title already exists." });
      }
    }

    if (typeof updates.assignedTo === "string") {
      updates.assignedTo = new mongoose.Types.ObjectId(updates.assignedTo);
    } else if (!updates.assignedTo) {
      updates.assignedTo = existing.assignedTo;
    }

    updates.updatedAt = Date.now();

    const task = await Task.findByIdAndUpdate(id, updates, { new: true }).populate("assignedTo");

    const log = await Log.create({
      action: "updated",
      taskId: task._id,
      userId: req.user.id,
    });

    await emitTaskUpdate(req.app, task._id);
    await emitLog(req.app, log._id);

    res.json(task);
  } catch (err) {
    console.error("PUT /api/tasks/:id failed:", err.message);
    console.error("Full error:", err);
    return res.status(400).json({ error: err.message });
  }
});

router.post("/smart-assign/:id", async (req, res) => {
  const { id } = req.params;
  const { updatedAt } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

   if (new Date(updatedAt).toISOString() !== new Date(task.updatedAt).toISOString()) {
  return res.status(409).json({ conflict: true, serverData: task });
}

    const users = await User.find();
    const counts = await Promise.all(
      users.map(async (u) => ({
        id: u._id,
        count: await Task.countDocuments({ assignedTo: u._id, status: { $ne: "Done" } }),
      }))
    );

    const bestUserId = counts.sort((a, b) => a.count - b.count)[0].id;
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { assignedTo: bestUserId, updatedAt: Date.now() },
      { new: true }
    ).populate("assignedTo");

    const log = await Log.create({
      action: "smart-assigned",
      taskId: id,
      userId: req.user.id,
    });

    await emitTaskUpdate(req.app, updatedTask._id);
    await emitLog(req.app, log._id);

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);

    const log = await Log.create({
      action: "deleted",
      taskId: id,
      userId: req.user.id, 
    });

    emitTaskDelete(req.app, id);
    await emitLog(req.app, log._id); 
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
