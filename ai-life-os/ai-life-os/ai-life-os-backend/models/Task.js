const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label:    { type: String, required: true },
  done:     { type: Boolean, default: false },
  category: { type: String, default: 'work' },
  priority: { type: String, enum: ['critical','high','medium','low'], default: 'medium' },
  time:     { type: String, default: '' },
  date:     { type: Date, default: Date.now },
  doneAt:   { type: Date, default: null },
});

TaskSchema.index({ userId: 1, date: -1 });
module.exports = mongoose.model('Task', TaskSchema);