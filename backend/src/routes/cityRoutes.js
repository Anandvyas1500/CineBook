const express = require('express');
const { getCities } = require('../controllers/cityController');

const router = express.Router();

// Public route — used by frontend CityContext
router.get('/', getCities);

module.exports = router;
