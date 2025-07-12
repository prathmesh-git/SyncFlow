const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const authenticateUser = require('../middleware/auth');


// protect logs routes
router.use(authenticateUser);


router.get('/', async (req, res) => {
    const logs = await Log.find().sort({timestamp: -1}).limit(20).populate('userId').populate('taskId');
    res.json(logs);
});

module.exports = router;