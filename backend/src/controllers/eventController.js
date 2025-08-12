const prisma = require('../config/prisma');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { organizer: true }
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
      include: { organizer: true }
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
      }
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
      }
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

    await prisma.event.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting event with id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete event.', details: error.message });
  }
};
