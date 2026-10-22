const mongoose = require('mongoose');

const StartupSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idea:        { type: String, required: true },
  industry:    { type: String, default: 'SaaS' },
  stage:       { type: String, default: 'idea' },
  target:      { type: String, default: '' },
  revenue:     { type: String, default: 'subscription' },
  teamSize:    { type: String, default: 'solo' },
  budget:      { type: Number, default: 0 },
  competitors: { type: String, default: '' },
  metrics: {
    mrr:   { type: String, default: '$0' },
    users: { type: String, default: '0' },
    churn: { type: String, default: '0%' },
    cac:   { type: String, default: '$0' },
  },
  tasks: [{
    task:  String,
    done:  { type: Boolean, default: false },
    phase: { type: String, enum: ['validate','build','launch'], default: 'validate' },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Startup', StartupSchema);