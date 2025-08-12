const express = require('express');
const router = express.Router();
const attendeeController = require('../controllers/attendeeController');

router.post('/events/:eventId/attendees', attendeeController.addAttendee);
router.delete('/attendees/:attendeeId', attendeeController.removeAttendee);
router.get('/events/:eventId/attendees', attendeeController.getAttendeesForEvent);

module.exports = router;
