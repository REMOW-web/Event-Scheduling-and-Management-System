
const prisma = require('../prisma');

exports.addAttendee = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email } = req.body;

    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const attendee = await prisma.attendee.create({
      data: {
        name,
        email,
        event: { connect: { id: parseInt(eventId) } },
      },
    });

    res.status(201).json(attendee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add attendee' });
  }
};

exports.removeAttendee = async (req, res) => {
  try {
    const { attendeeId } = req.params;

    await prisma.attendee.delete({
      where: { id: parseInt(attendeeId) },
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove attendee' });
  }
};

exports.getAttendeesForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const attendees = await prisma.attendee.findMany({
      where: { eventId: parseInt(eventId) },
    });

    res.json(attendees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
};
