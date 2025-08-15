const express = require('express');
const router = express.Router({ mergeParams: true }); 
const attendeeController = require('../controllers/attendeeController');

router.post('/', attendeeController.addAttendeeToEvent);
router.get('/', attendeeController.getAllAttendees);
router.delete('/:attendeeId', attendeeController.removeAttendeeFromEvent);

module.exports = router;
