const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/add", async (req, res) => {
    try {
        const {name, email} = req.body;

        const newUser = new User({name, email});
        await newUser.save();

        res.status(201).json({message:"user saved"});
    } catch (err) {
        res.status(500).json({message:err.message});
    }
});

module.exports = router;