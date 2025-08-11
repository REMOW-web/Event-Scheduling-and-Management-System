const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const eventRoutes = require('./routes/eventRoutes'); 
const prisma = require('./config/db'); 

const app = express();


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use('/api/events', eventRoutes); 


app.get('/', (req, res) => {
  res.send('Event Scheduling API is running...');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

module.exports = app;
