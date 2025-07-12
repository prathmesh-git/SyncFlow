const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Task = require('../models/Tasks');
const Log = require('../models/Log');
const User = require('../models/User');
const authenticateUser = require('../middlewares/auth.js');


// protect all task routes
router.use(authenticateUser);
// Smart Assign
router.post('/smart-assign/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣  Find all users and count their active tasks
    const users = await User.find();
    const userTaskCounts = {};

    for (const user of users) {
      const count = await Task.countDocuments({
        assignedTo: user._id,
        status: { $ne: 'Done' }          // only tasks not done
      });
      userTaskCounts[user._id] = count;
    }

    // 2️⃣  Pick the user with the fewest active tasks
    const bestUserId = Object.entries(userTaskCounts)
      .sort((a, b) => a[1] - b[1])[0][0];

    // 3️⃣  Update the task’s assignedTo
    await Task.findByIdAndUpdate(
      id,
      { assignedTo: bestUserId, updatedAt: Date.now() },
      { new: false }                       // we’ll re‑fetch below
    );

    // 4️⃣  Re‑fetch the task and populate assignedTo
    const updatedTask = await Task.findById(id).populate('assignedTo');

    // 5️⃣  Log the action
    await Log.create({
      action: 'smart-assigned',
      taskId: id,
      userId: bestUserId
    });

    // 6️⃣  Return the populated task
    res.json(updatedTask);

  } catch (err) {
    console.error('Smart Assign error:', err);
    res.status(400).json({ error: err.message });
  }
});


// get tasks

router.get('/', async (req, res) => {
    const tasks = await Task.find().populate('assignedTo');
    res.json(tasks);
});

// create tasks

router.post('/', async(req, res) => {
    const { title, description, assignedTo, status, priority } = req.body;
    try {
        const task = new Task({ title, description, assignedTo, status, priority })
        await task.save();

        await Log.create({ action: "created", taskId: task._id, userId: assignedTo});

        res.status(201).json(task);

    }catch(err) {
        res.status(400).json({ error: err.message });
    }
});

// update and handle conflict

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  let { updatedAt, _id, __v, ...updates } = req.body;

  try {
    const existingTask = await Task.findById(id);
    if (!existingTask) return res.status(404).json({ error: "Task not found" });

    if (new Date(updatedAt).getTime() !== new Date(existingTask.updatedAt).getTime()) {
      return res.status(409).json({ conflict: true, serverData: existingTask });
    }

    // ✅ Fix: cast assignedTo to ObjectId if it's a string
    if (typeof updates.assignedTo === 'string') {
      updates.assignedTo = new mongoose.Types.ObjectId(updates.assignedTo);
    } else if (!updates.assignedTo) {
      updates.assignedTo = existingTask.assignedTo;
    }

    updates.updatedAt = Date.now();
    console.log("🛠️ Saving updates:", updates);

    const populated = await Task.findByIdAndUpdate(id, updates, {
  new: true,
}).populate('assignedTo');

res.json(populated);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Delete task

router.delete('/:id', async (req, res) => {
    const {id} = req.params;

    try{
        await Task.findByIdAndDelete(id);
        await Log.create({ action: "deleted", taskId: id });
        res.json({ message: "Task deleted" });
    }catch(err) {
        res.status(400).json({error: err.message});
    }
});


module.exports = router;