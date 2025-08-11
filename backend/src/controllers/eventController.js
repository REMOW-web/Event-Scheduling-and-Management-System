const prisma = require('../prisma');

exports.getAllEvents = async (req, res) => {
  const events = await prisma.event.findMany();
  res.json(events);
};

exports.getEventById = async (req, res) => {
  const { id } = req.params;
  const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
  event ? res.json(event) : res.status(404).json({ error: 'Event not found' });
};

exports.createEvent = async (req, res) => {
  const { title, description, date } = req.body;
  const newEvent = await prisma.event.create({
    data: { title, description, date: new Date(date) },
  });
  res.status(201).json(newEvent);
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date } = req.body;
  const updated = await prisma.event.update({
    where: { id: parseInt(id) },
    data: { title, description, date: new Date(date) },
  });
  res.json(updated);
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  await prisma.event.delete({ where: { id: parseInt(id) } });
  res.status(204).end();
};
