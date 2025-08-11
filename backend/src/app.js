const express = require('express');
const eventRoutes = require('./routes/eventRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/events', eventRoutes);

module.exports = app;
