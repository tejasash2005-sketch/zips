const express = require('express');
const Task = require('../models/Task');
const Journal = require('../models/Journal');
const protect = require('../middleware/auth');
const router = express.Router();

// ── TASKS ──────────────────────────────────────

// Get today's tasks
router.get('/tasks', protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    const tasks = await Task.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ priority: 1, createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tasks (for history)
router.get('/tasks/all', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort('-date').limit(100);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/tasks', protect, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user._id });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task (toggle done, edit)
router.put('/tasks/:id', protect, async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.body.done === true) update.doneAt = new Date();
    if (req.body.done === false) update.doneAt = null;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/tasks/:id', protect, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── JOURNAL ─────────────────────────────────────

// Get journals
router.get('/journal', protect, async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user._id })
      .sort('-date').limit(30);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create journal entry
router.post('/journal', protect, async (req, res) => {
  try {
    const entry = await Journal.create({ ...req.body, userId: req.user._id });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update journal entry
router.put('/journal/:id', protect, async (req, res) => {
  try {
    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete journal entry
router.delete('/journal/:id', protect, async (req, res) => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;