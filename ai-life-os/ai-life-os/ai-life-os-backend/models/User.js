const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['user', 'coach', 'admin'], default: 'user' },
  avatar:   { type: String, default: '' },
  coachId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  clients:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    aiProvider: { type: String, enum: ['groq', 'ollama', 'auto'], default: 'auto' },
  },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);