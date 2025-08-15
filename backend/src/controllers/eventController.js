const prisma = require('../config/prisma');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { organizer: true, attendees: true }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching all events:', error);
    res.status(500).json({ error: 'Failed to fetch events.', details: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: { organizer: true, attendees: true }
    });

    event
      ? res.json(event)
      : res.status(404).json({ error: 'Event not found' });
  } catch (error) {
    console.error(`Error fetching event with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch event.', details: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, startTime, endTime, organizerId } = req.body;

    if (!title || !startTime || !endTime || !organizerId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'Start time must be before end time.' });
    }

    const conflict = await prisma.event.findFirst({
      where: {
        organizerId,
        startTime: { lte: new Date(endTime) },
        endTime: { gte: new Date(startTime) }
      }
    });

    if (conflict) {
      return res.status(400).json({ error: 'Scheduling conflict with another event.' });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        organizerId
      },
      include: { organizer: true, attendees: true }
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event.', details: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, startTime, endTime, organizerId } = req.body;

    if (!title || !startTime || !endTime || !organizerId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'Start time must be before end time.' });
    }

    const conflict = await prisma.event.findFirst({
      where: {
        id: { not: parseInt(id) },
        organizerId,
        startTime: { lte: new Date(endTime) },
        endTime: { gte: new Date(startTime) }
      }
    });

    if (conflict) {
      return res.status(400).json({ error: 'Scheduling conflict with another event.' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        organizerId
      },
      include: { organizer: true, attendees: true }
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error(`Error updating event with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update event.', details: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the event details to include in the response
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: { organizer: true, attendees: true }
    });

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: `Event with ID ${id} not found`
      });
    }

    await prisma.event.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: `Event "${event.title}" has been successfully deleted`,
      deletedEvent: event
    });
  } catch (error) {
    console.error(`Error deleting event with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete event.', details: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { organizerId, date, duration } = req.query;

    if (!organizerId || !date || !duration) {
      return res.status(400).json({ error: 'Missing required query parameters: organizerId, date, duration.' });
    }

    const dayStart = new Date(date + 'T00:00:00.000Z');
    const dayEnd = new Date(date + 'T23:59:59.999Z');
    const eventDuration = parseInt(duration);

    const events = await prisma.event.findMany({
      where: {
        organizerId: parseInt(organizerId),
        startTime: { gte: dayStart, lt: dayEnd }
      },
      orderBy: { startTime: 'asc' }
    });

    const workingDayStart = new Date(dayStart);
    workingDayStart.setUTCHours(9, 0, 0, 0);
    const workingDayEnd = new Date(dayStart);
    workingDayEnd.setUTCHours(18, 0, 0, 0);

    let availableSlots = [];
    let slotStart = workingDayStart;

    for (const event of events) {
      const eventStart = event.startTime;

      if ((eventStart - slotStart) / 60000 >= eventDuration) {
        availableSlots.push({ start: slotStart, end: eventStart });
      }

      slotStart = new Date(Math.max(slotStart.getTime(), event.endTime.getTime()));
    }

    if ((workingDayEnd - slotStart) / 60000 >= eventDuration) {
      availableSlots.push({ start: slotStart, end: workingDayEnd });
    }

    const formattedSlots = availableSlots.map(slot => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString()
    }));

    res.json(formattedSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots.', details: error.message });
  }
};

exports.addAttendeeToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email, userId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields: name, email.' });
    }

    const eventExists = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return res.status(400).json({ error: 'Invalid userId.' });
      }
    }

    const alreadyRegistered = await prisma.attendee.findUnique({
      where: { eventId_email: { eventId: parseInt(eventId), email } }
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

    await prisma.attendee.delete({ where: { id: parseInt(attendeeId) } });

    res.status(204).end();
  } catch (error) {
    console.error('Error removing attendee from event:', error);
    res.status(500).json({ error: 'Failed to remove attendee.', details: error.message });
  }
};
