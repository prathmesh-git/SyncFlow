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
  const io  = app.get("io");
  const log = await Log.findById(logId).populate("taskId userId");
  io.emit("log-created", log);
};

router.get("/", async (_req, res) => {
  const tasks = await Task.find().populate("assignedTo");
  res.json(tasks);
});

router.post("/", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    const log  = await Log.create({ action: "created", taskId: task._id, userId: req.body.assignedTo });
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
    const existing = await Task.findById(id);
    if (!existing) return res.status(404).json({ error: "Task not found" });
    if (new Date(updatedAt).getTime() !== new Date(existing.updatedAt).getTime())
      return res.status(409).json({ conflict: true, serverData: existing });

    if (typeof updates.assignedTo === "string")
      updates.assignedTo = new mongoose.Types.ObjectId(updates.assignedTo);
    else if (!updates.assignedTo) updates.assignedTo = existing.assignedTo;

    updates.updatedAt = Date.now();

    const task = await Task.findByIdAndUpdate(id, updates, { new: true }).populate("assignedTo");
    const log  = await Log.create({ action: "updated", taskId: task._id, userId: updates.assignedTo });
    await emitTaskUpdate(req.app, task._id);
    await emitLog(req.app, log._id);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/smart-assign/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const users  = await User.find();
    const counts = await Promise.all(
      users.map(async (u) => ({
        id: u._id,
        count: await Task.countDocuments({ assignedTo: u._id, status: { $ne: "Done" } }),
      }))
    );

    const bestUserId = counts.sort((a, b) => a.count - b.count)[0].id;
    await Task.findByIdAndUpdate(id, { assignedTo: bestUserId, updatedAt: Date.now() });
    const task = await Task.findById(id).populate("assignedTo");

    const log = await Log.create({ action: "smart-assigned", taskId: id, userId: bestUserId });
    await emitTaskUpdate(req.app, task._id);
    await emitLog(req.app, log._id);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);
    const log = await Log.create({ action: "deleted", taskId: id });
    emitTaskDelete(req.app, id);
    await emitLog(req.app, log._id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
