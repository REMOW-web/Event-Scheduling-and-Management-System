const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const app = express();

app.use(cors());
app.use(express.json());

const eventRoutes = require('./routes/eventRoutes');
const attendeeRoutes = require('./routes/attendeeRoute'); 
const organizerRoutes = require('./routes/organizerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use((req, res, next) => {
    console.log('\n=== Incoming Request ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Body:', req.body);
    console.log('======================\n');
    next();
});

app.use('/api/events', eventRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/api/events/:eventId/attendees', attendeeRoutes);

app.use(errorHandler);

module.exports = app;
