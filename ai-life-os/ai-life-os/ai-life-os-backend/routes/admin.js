const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Finance = require('../models/Finance');
const Journal = require('../models/Journal');
const Startup = require('../models/Startup');
const Movie = require('../models/Movie');
const protect = require('../middleware/auth');
const checkRole = require('../middleware/role');
const router = express.Router();

// Restrict all routes in this file to Admin only
router.use(protect);
router.use(checkRole('admin'));

// GET /api/admin/stats — System Overview
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalCoaches, totalTasks, totalStartups, totalJournals, totalMovies] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'coach' }),
      Task.countDocuments(),
      Startup.countDocuments(),
      Journal.countDocuments(),
      Movie.countDocuments(),
    ]);

    const recentUsers = await User.find().select('-password').sort('-createdAt').limit(5);

    res.json({
      metrics: {
        totalUsers,
        totalCoaches,
        totalAdmins: await User.countDocuments({ role: 'admin' }),
        totalTasks,
        totalStartups,
        totalJournals,
        totalMovies,
      },
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — Get All Users
router.get('/users', async (req, res) => {
  const { query, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (query) {
    filter.$or = [
      { name: new RegExp(query, 'i') },
      { email: new RegExp(query, 'i') },
    ];
  }

  try {
    const users = await User.find(filter)
      .select('-password')
      .populate('coachId', 'name email')
      .sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/user/:userId/role — Change User Role
router.put('/user/:userId/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'coach', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log(`👑 Admin updated role for ${user.email} to '${role}'`);
    res.json({ message: `Role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/user/:userId — Delete User & Data
router.delete('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    await Promise.all([
      User.findByIdAndDelete(userId),
      Task.deleteMany({ userId }),
      Finance.deleteMany({ userId }),
      Journal.deleteMany({ userId }),
      Startup.deleteMany({ userId }),
      Movie.deleteMany({ userId }),
    ]);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
