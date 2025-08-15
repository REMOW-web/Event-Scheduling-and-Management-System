const prisma = require('../config/prisma');

exports.getAllAttendees = async (req, res) => {
  try {
    const { eventId } = req.query;

    const attendees = await prisma.attendee.findMany({
      where: eventId ? { eventId: parseInt(eventId) } : {},
      include: { user: true, event: true }
    });

    res.json(attendees);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({ error: 'Failed to fetch attendees.', details: error.message });
  }
};

exports.getAttendeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendee = await prisma.attendee.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, event: true }
    });

    attendee
      ? res.json(attendee)
      : res.status(404).json({ error: 'Attendee not found' });
  } catch (error) {
    console.error(`Error fetching attendee with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch attendee.', details: error.message });
  }
};

exports.addAttendeeToEvent = async (req, res) => {
  try {
    // Comprehensive request logging
    console.log('Controller - Full URL:', req.originalUrl);
    console.log('Controller - Base URL:', req.baseUrl);
    console.log('Controller - Path:', req.path);
    console.log('Controller - All Params:', req.params);
    console.log('Controller - Query:', req.query);
    console.log('Controller - Body:', req.body);
    
    let eventId = req.params.eventId;
    
    if (!eventId) {
        const pathParts = req.path.split('/');
        eventId = pathParts.find(part => !isNaN(part));
    }
    
    console.log('Controller - Final eventId:', eventId);
    
    const { name, email, userId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields: name, email.' });
    }

    const eventId_parsed = parseInt(eventId);
    if (isNaN(eventId_parsed)) {
      return res.status(400).json({ error: 'Invalid event ID format. Please provide a valid number.', providedId: eventId });
    }

    const eventExists = await prisma.event.findUnique({ 
      where: { id: eventId_parsed }
    });
    if (!eventExists) {
      return res.status(404).json({ error: `Event with ID ${eventId_parsed} not found.` });
    }

    if (userId) {
      const userId_parsed = parseInt(userId);
      if (isNaN(userId_parsed)) {
        return res.status(400).json({ error: 'Invalid user ID format.' });
      }
      const userExists = await prisma.user.findUnique({ where: { id: userId_parsed } });
      if (!userExists) {
        return res.status(400).json({ error: 'Invalid userId.' });
      }
    }

    const alreadyRegistered = await prisma.attendee.findFirst({
      where: { 
        AND: [
          { eventId: eventId_parsed },
          { email: email }
        ]
      }
    });

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Attendee already registered for this event.' });
    }

    const newAttendee = await prisma.attendee.create({
      data: {
        name,
        email,
        eventId: parseInt(eventId),
        userId: userId || null
      },
      include: { user: true, event: true }
    });

    res.status(201).json(newAttendee);
  } catch (error) {
    console.error('Error adding attendee to event:', error);
    res.status(500).json({ error: 'Failed to add attendee.', details: error.message });
  }
};

exports.removeAttendeeFromEvent = async (req, res) => {
  try {
    const { eventId, attendeeId } = req.params;

    const attendee = await prisma.attendee.findUnique({
      where: { id: parseInt(attendeeId) }
    });

    if (!attendee || attendee.eventId !== parseInt(eventId)) {
      return res.status(404).json({ error: 'Attendee not found for this event.' });
    }

    const deletedAttendee = await prisma.attendee.delete({ 
      where: { id: parseInt(attendeeId) },
      include: { event: true }
    });

    res.status(200).json({
      success: true,
      message: `Attendee ${deletedAttendee.name} has been successfully removed from the event "${deletedAttendee.event.title}"`,
      deletedAttendee
    });
  } catch (error) {
    console.error('Error removing attendee from event:', error);
    res.status(500).json({ error: 'Failed to remove attendee.', details: error.message });
  }
};
