const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');
const checkRole = require('../middleware/role');
const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'ailifeos_jwt_secret_default_2025', { expiresIn: '30d' });

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // Validate role if specified
    const validRoles = ['user', 'coach', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'user';

    const user = await User.create({ name, email, password, role: userRole });
    console.log(`✅ New user registered: ${email} (${userRole})`);
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        coachId: user.coachId,
        settings: user.settings,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    console.log(`✅ User logged in: ${email} (${user.role})`);
    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        coachId: user.coachId,
        settings: user.settings,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ME
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('coachId', 'name email avatar')
      .populate('clients', 'name email avatar createdAt')
      .select('-password');

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coach: user.coachId,
      clients: user.clients,
      settings: user.settings,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIST ALL COACHES AVAILABLE
router.get('/coaches', protect, async (req, res) => {
  try {
    const coaches = await User.find({ role: 'coach' }).select('name email avatar createdAt');
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ASSIGN / CHANGE COACH
router.put('/assign-coach', protect, async (req, res) => {
  const { coachId } = req.body;
  try {
    if (coachId) {
      const coach = await User.findOne({ _id: coachId, role: 'coach' });
      if (!coach) return res.status(404).json({ error: 'Coach not found' });

      // Link coach to user and user to coach's client list
      await User.findByIdAndUpdate(req.user._id, { coachId });
      await User.findByIdAndUpdate(coachId, { $addToSet: { clients: req.user._id } });
    } else {
      // Unassign coach
      if (req.user.coachId) {
        await User.findByIdAndUpdate(req.user.coachId, { $pull: { clients: req.user._id } });
      }
      await User.findByIdAndUpdate(req.user._id, { coachId: null });
    }

    const updatedUser = await User.findById(req.user._id)
      .populate('coachId', 'name email avatar')
      .select('-password');

    res.json({ message: 'Coach assignment updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PROFILE
router.put('/profile', protect, async (req, res) => {
  try {
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.avatar) updateData.avatar = req.body.avatar;
    if (req.body.settings) updateData.settings = { ...req.user.settings, ...req.body.settings };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHANGE PASSWORD
router.put('/password', protect, async (req, res) => {
  const { current, newPassword } = req.body;
  if (!current || !newPassword)
    return res.status(400).json({ error: 'Both fields required' });

  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(current)))
      return res.status(400).json({ error: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: '✅ Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;