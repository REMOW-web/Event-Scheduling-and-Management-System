const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const eventRoutes = require('./routes/eventRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');

app.use('/api/events', eventRoutes);
app.use('/api', attendeeRoutes); 

module.exports = app;
