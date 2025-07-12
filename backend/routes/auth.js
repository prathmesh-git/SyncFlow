const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword});
        await user.save();
        res.status(201).json({ message: "User registereed Succesfully"});

    }catch(err){
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async(req, res) => {
    const { username, password} = req.body;
    try{
        const user = await User.findOne({ username });
        if(!user) return res.status(404).json({error: "User not found"});

        const valid = await bcrypt.compare(password, user.password);
        if(!valid) return res.status(401).json({error: "Invalid Passeord"});

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token, username: user.username, userId: user._id });

    }catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;