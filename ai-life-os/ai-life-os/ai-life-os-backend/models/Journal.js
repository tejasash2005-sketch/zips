const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entry:      { type: String, required: true },
  mood:       { type: String, default: 'neutral' },
  energy:     { type: Number, default: 70 },
  water:      { type: Number, default: 0 },
  sleep:      { type: Number, default: 0 },
  steps:      { type: Number, default: 0 },
  aiAnalysis: { type: String, default: '' },
  date:       { type: Date, default: Date.now },
});

JournalSchema.index({ userId: 1, date: -1 });
module.exports = mongoose.model('Journal', JournalSchema);