const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const attendeeController = require('../controllers/attendeeController');

router.get('/', eventController.getAllEvents);
router.get('/available-slots', eventController.getAvailableSlots);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
