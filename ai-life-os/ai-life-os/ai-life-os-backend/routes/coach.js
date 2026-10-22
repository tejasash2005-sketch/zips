const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Finance = require('../models/Finance');
const Journal = require('../models/Journal');
const Startup = require('../models/Startup');
const protect = require('../middleware/auth');
const checkRole = require('../middleware/role');
const router = express.Router();

// Enforce coach or admin role for all routes here
router.use(protect);
router.use(checkRole(['coach', 'admin']));

// GET /api/coach/clients — List all clients assigned to this coach
router.get('/clients', async (req, res) => {
  try {
    const clients = await User.find({ coachId: req.user._id })
      .select('name email avatar createdAt settings')
      .sort('-createdAt');

    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/coach/client/:clientId — Detailed Life Summary of a Client
router.get('/client/:clientId', async (req, res) => {
  try {
    const client = await User.findById(req.params.clientId).select('-password');
    if (!client) return res.status(404).json({ error: 'Client not found' });

    // Verify client belongs to this coach (unless coach is admin)
    if (req.user.role !== 'admin' && String(client.coachId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden: Client is not assigned to you' });
    }

    const [tasks, finance, journals, startups] = await Promise.all([
      Task.find({ userId: client._id }).sort('-date').limit(20),
      Finance.findOne({ userId: client._id }),
      Journal.find({ userId: client._id }).sort('-date').limit(10),
      Startup.find({ userId: client._id }).sort('-updatedAt'),
    ]);

    res.json({
      client,
      summary: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.done).length,
        finance: finance || { income: 0, expenses: [], goals: [], investments: [] },
        recentJournalMood: journals[0]?.mood || 'unknown',
        startupsCount: startups.length,
      },
      tasks,
      journals,
      startups,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coach/task/:clientId — Assign a Task to a Client
router.post('/task/:clientId', async (req, res) => {
  const { label, priority, category, time } = req.body;
  if (!label) return res.status(400).json({ error: 'Task label is required' });

  try {
    const client = await User.findById(req.params.clientId);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const task = await Task.create({
      userId: client._id,
      label: `[Coach Task] ${label}`,
      priority: priority || 'high',
      category: category || 'personal',
      time: time || '',
    });

    res.status(201).json({ message: 'Task assigned to client successfully', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
