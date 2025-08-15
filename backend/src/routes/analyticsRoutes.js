const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { organizerOnly } = require('../middlewares/roleMiddleware');

router.get('/', protect, organizerOnly, getAnalytics);

module.exports = router;
