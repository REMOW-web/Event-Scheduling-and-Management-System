const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const eventRoutes = require('./routes/eventRoutes');
const attendeeRoutes = require('./routes/attendeeRoute');
const organizerRoutes = require('./routes/organizerRoutes');

app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);
app.use('/api/organizers', organizerRoutes);

module.exports = app;
