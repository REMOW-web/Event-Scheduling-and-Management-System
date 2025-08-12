const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizerController');

router.post('/', organizerController.createOrganizer);
router.get('/', organizerController.getAllOrganizers);

module.exports = router;
