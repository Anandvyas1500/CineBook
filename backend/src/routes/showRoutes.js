const express = require('express');
const {
  getShows,
  getShowById,
  getShowAvailability
} = require('../controllers/showController');

const router = express.Router();

router.get('/', getShows);
router.get('/:id/availability', getShowAvailability);
router.get('/:id', getShowById);

module.exports = router;

