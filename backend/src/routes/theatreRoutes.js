const express = require('express');
const { getTheatres, getTheatreById } = require('../controllers/theatreController');
const { getCities } = require('../controllers/cityController');

const router = express.Router();

router.get('/cities', getCities);
router.get('/', getTheatres);
router.get('/:id', getTheatreById);

module.exports = router;
