const express = require('express');
const Startup = require('../models/Startup');
const protect = require('../middleware/auth');
const router = express.Router();

// Get all startups for user
router.get('/', protect, async (req, res) => {
  try {
    const startups = await Startup.find({ userId: req.user._id }).sort('-updatedAt');
    res.json(startups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create startup
router.post('/', protect, async (req, res) => {
  try {
    const startup = await Startup.create({ ...req.body, userId: req.user._id });
    res.status(201).json(startup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update startup
router.put('/:id', protect, async (req, res) => {
  try {
    const startup = await Startup.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(startup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete startup
router.delete('/:id', protect, async (req, res) => {
  try {
    await Startup.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Startup deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle task done inside startup
router.put('/:id/task/:taskIndex', protect, async (req, res) => {
  try {
    const startup = await Startup.findOne({ _id: req.params.id, userId: req.user._id });
    if (!startup) return res.status(404).json({ error: 'Not found' });
    startup.tasks[req.params.taskIndex].done = req.body.done;
    startup.updatedAt = new Date();
    await startup.save();
    res.json(startup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;