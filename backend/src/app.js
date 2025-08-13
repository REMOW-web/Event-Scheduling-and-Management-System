const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const eventRoutes = require('./routes/eventRoutes');
const attendeeRoutes = require('./routes/attendeeRoute');
const organizerRoutes = require('./routes/organizerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/analytics', analyticsRoutes);

module.exports = app;
