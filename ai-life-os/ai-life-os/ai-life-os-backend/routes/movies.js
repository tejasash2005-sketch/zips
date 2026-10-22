const express = require('express');
const axios = require('axios');
const protect = require('../middleware/auth');
const Movie = require('../models/Movie');
const router = express.Router();

const TMDB = 'https://api.themoviedb.org/3';
const KEY = process.env.TMDB_API_KEY;

// Check if TMDB key exists
const tmdbAvailable = () => KEY && KEY !== 'your_tmdb_key_here';

// POPULAR
router.get('/popular', async (req, res) => {
  if (!tmdbAvailable()) return res.json({ results: [], message: 'TMDB key not configured' });
  try {
    const { data } = await axios.get(`${TMDB}/movie/popular`, {
      params: { api_key: KEY, language: 'en-US', page: 1 }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'TMDB fetch failed' });
  }
});

// TRENDING
router.get('/trending', async (req, res) => {
  if (!tmdbAvailable()) return res.json({ results: [] });
  try {
    const { data } = await axios.get(`${TMDB}/trending/movie/week`, {
      params: { api_key: KEY }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'TMDB fetch failed' });
  }
});

// SEARCH
router.get('/search', async (req, res) => {
  const { query, page = 1 } = req.query;
  if (!query) return res.status(400).json({ error: 'Query required' });
  if (!tmdbAvailable()) return res.json({ results: [], message: 'TMDB key not set' });

  try {
    const { data } = await axios.get(`${TMDB}/search/movie`, {
      params: { api_key: KEY, query, page, language: 'en-US' }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'TMDB search failed' });
  }
});

// DETAIL + TRAILER + STREAMING PROVIDERS
router.get('/detail/:id', async (req, res) => {
  if (!tmdbAvailable()) return res.status(400).json({ error: 'TMDB key not set' });

  try {
    const [detail, videos, providers] = await Promise.all([
      axios.get(`${TMDB}/movie/${req.params.id}`, { params: { api_key: KEY } }),
      axios.get(`${TMDB}/movie/${req.params.id}/videos`, { params: { api_key: KEY } }),
      axios.get(`${TMDB}/movie/${req.params.id}/watch/providers`, { params: { api_key: KEY } }),
    ]);

    const trailer = videos.data.results.find(
      v => v.type === 'Trailer' && v.site === 'YouTube'
    );
    const us = providers.data.results?.US || {};

    res.json({
      ...detail.data,
      trailerKey: trailer?.key || null,
      streaming: us.flatrate || [],
      rent: us.rent || [],
      buy: us.buy || [],
    });
  } catch (err) {
    res.status(500).json({ error: 'TMDB detail failed' });
  }
});

// BY GENRE
router.get('/genre/:genreId', async (req, res) => {
  if (!tmdbAvailable()) return res.json({ results: [] });
  try {
    const { data } = await axios.get(`${TMDB}/discover/movie`, {
      params: {
        api_key: KEY,
        with_genres: req.params.genreId,
        sort_by: 'popularity.desc',
        page: req.query.page || 1,
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── WATCHLIST (auth required) ──────────────────────────────

router.get('/watchlist', protect, async (req, res) => {
  const items = await Movie.find({ userId: req.user._id }).sort('-addedAt');
  res.json(items);
});

router.post('/watchlist', protect, async (req, res) => {
  try {
    const item = await Movie.findOneAndUpdate(
      { userId: req.user._id, movieId: req.body.movieId },
      { ...req.body, userId: req.user._id },
      { upsert: true, new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/watchlist/:movieId', protect, async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.body.status === 'watched') update.watchedAt = new Date();
    const item = await Movie.findOneAndUpdate(
      { userId: req.user._id, movieId: req.params.movieId },
      update,
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/watchlist/:movieId', protect, async (req, res) => {
  await Movie.findOneAndDelete({ userId: req.user._id, movieId: req.params.movieId });
  res.json({ message: 'Removed from watchlist' });
});

module.exports = router;