const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  income:   { type: Number, default: 0 },
  tax:      { type: Number, default: 22 },
  debt:     { type: Number, default: 0 },
  debtRate: { type: Number, default: 18 },
  expenses: [{
    name:      String,
    amount:    Number,
    category:  { type: String, default: 'other' },
    recurring: { type: Boolean, default: false },
    date:      { type: Date, default: Date.now },
  }],
  goals: [{
    name:     String,
    target:   Number,
    saved:    { type: Number, default: 0 },
    deadline: String,
    done:     { type: Boolean, default: false },
  }],
  investments: [{
    name:   String,
    amount: Number,
    return: { type: Number, default: 0 },
  }],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Finance', FinanceSchema);