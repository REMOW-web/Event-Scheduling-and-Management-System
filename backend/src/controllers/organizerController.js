const prisma = require('../config/prisma');

exports.createOrganizer = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists. Please use a different email.' });
    }

    const organizer = await prisma.user.create({
      data: { name, email }
    });

    res.status(201).json(organizer);
  } catch (error) {
    console.error('Error creating organizer:', error);
    res.status(500).json({ error: 'Failed to create organizer.', details: error.message });
  }
};

exports.getAllOrganizers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching organizers:', error);
    res.status(500).json({ error: 'Failed to fetch organizers.' });
  }
};
