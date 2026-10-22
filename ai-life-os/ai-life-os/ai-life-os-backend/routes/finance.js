const express = require('express');
const Finance = require('../models/Finance');
const protect = require('../middleware/auth');
const router = express.Router();

// Get or create finance doc
router.get('/', protect, async (req, res) => {
  try {
    let finance = await Finance.findOne({ userId: req.user._id });
    if (!finance) finance = await Finance.create({ userId: req.user._id });
    res.json(finance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full update
router.put('/', protect, async (req, res) => {
  try {
    const finance = await Finance.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(finance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add expense
router.post('/expense', protect, async (req, res) => {
  try {
    const finance = await Finance.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { expenses: req.body } },
      { upsert: true, new: true }
    );
    res.json(finance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete expense
router.delete('/expense/:id', protect, async (req, res) => {
  try {
    const finance = await Finance.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { expenses: { _id: req.params.id } } },
      { new: true }
    );
    res.json(finance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add goal
router.post('/goal', protect, async (req, res) => {
  try {
    const finance = await Finance.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { goals: req.body } },
      { upsert: true, new: true }
    );
    res.json(finance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update goal
router.put('/goal/:id', protect, async (req, res) => {
  try {
    const finance = await Finance.findOneAndUpdate(
      { userId: req.user._id, 'goals._id': req.params.id },
      { $set: { 'goals.$': { ...req.body, _id: req.params.id } } },
      { new: true }
    );
    res.json(finance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add investment
router.post('/investment', protect, async (req, res) => {
  try {
    const finance = await Finance.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { investments: req.body } },
      { upsert: true, new: true }
    );
    res.json(finance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;