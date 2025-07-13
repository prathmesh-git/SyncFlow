const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const authenticateUser = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('userId', 'username')
      .populate('taskId', 'title');

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
