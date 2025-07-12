const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Log = require('../models/Log');
const User = require('../models/User');
const authenticateUser = require('../middleware/auth');


// protect all task routes
router.use(authenticateUser);


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

router.post('/:id', async (req, res) => {
    const { id } = req.params;
    const { updatedAt, ...updates } = req.body;

    try {
        const existingTask = await Task.findById(id);
        if(new Date(updatedAt).getTime() !== new Date(existingTask.updatedAt).getTime()) {
            return res.status(409).json({conflict: true, serverData: existingTask });
        }

        updates.updatedAt = Date.now();
        const updatedTask = await Task.findByIdAndUpdate(id, updates, {new:true});

        await Log.create({ action: "updated", taskId: id, userId: updates.assignedTo });

        res.json(updatedTask);

    }catch(err){
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

// Smart Assign
router.post('/smart-assign/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const users = await User.find();
    const userTaskCounts = {};

    for (let user of users) {
      const count = await Task.countDocuments({ assignedTo: user._id, status: { $ne: 'Done' } });
      userTaskCounts[user._id] = count;
    }

    const bestUserId = Object.entries(userTaskCounts).sort((a, b) => a[1] - b[1])[0][0];

    const task = await Task.findByIdAndUpdate(id, {
      assignedTo: bestUserId,
      updatedAt: Date.now()
    }, { new: true });

    await Log.create({ action: "smart-assigned", taskId: id, userId: bestUserId });

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;