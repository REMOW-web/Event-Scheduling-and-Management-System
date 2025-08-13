const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { organizerOnly } = require('../middleware/roleMiddleware');

router.get('/', protect, organizerOnly, getAnalytics);

module.exports = router;
