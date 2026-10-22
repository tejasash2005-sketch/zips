const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId:    { type: String, required: true },
  title:      String,
  poster:     String,
  year:       Number,
  genre:      String,
  rating:     Number,
  overview:   String,
  status:     { type: String, enum: ['watchlist', 'watched', 'favorite'], default: 'watchlist' },
  userRating: { type: Number, min: 1, max: 10, default: null },
  review:     { type: String, default: '' },
  addedAt:    { type: Date, default: Date.now },
  watchedAt:  { type: Date, default: null },
});

MovieSchema.index({ userId: 1, movieId: 1 }, { unique: true });
module.exports = mongoose.model('Movie', MovieSchema);