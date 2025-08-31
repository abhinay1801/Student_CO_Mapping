const express = require("express");
const Set = require("../models/Set");
const authenticateUser = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/fetchSubjects", authenticateUser, async (req, res) => {
  try {
    const subjects = await Set.find({ user: req.user._id }).distinct("subject");
    res.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/fetchSets", authenticateUser,async (req, res) => {
  const { subject } = req.query;

  if (!subject) {
    return res.status(400).json({ error: "Subject is required" });
  }

  try {
    const setData = await Set.findOne({ subject: subject});

    if (!setData) {
      return res.status(404).json({ error: "No sets found for this subject" });
    }

    res.json({ sets: setData.sets });
  } catch (error) {
    console.error("Error fetching sets:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/add", authenticateUser, async (req, res) => {
  const { sets, subject } = req.body;

  if (!subject) {
    return res.status(400).json({ error: "Subject is required" });
  }

  try {
    let existingSet = await Set.findOne({ subject: subject });

    if (existingSet) {
      existingSet.sets = sets;
      await existingSet.save();
      return res.status(200).json({ message: "Sets updated successfully!" });
    }
    const newSet = new Set({
      user: req.user._id,
      subject: subject,
      sets: sets,
    });

    await newSet.save();
    res.status(201).json({ message: "Sets stored successfully!" });
  } catch (error) {
    console.error("Error storing sets:", error);
    res.status(500).json({ message: "Error storing sets data" });
  }
});


module.exports = router;
