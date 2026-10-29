const express = require('express');
const {
  getMovies,
  getFeaturedMovies,
  getMovieById
} = require('../controllers/movieController');

const router = express.Router();

router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:idOrSlug', getMovieById);

module.exports = router;
