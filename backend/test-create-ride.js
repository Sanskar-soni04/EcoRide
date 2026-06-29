// backend/test-create-ride.js
require('dotenv').config();
const mongoose = require('mongoose');
const Ride = require('./models/ride');
const User = require('./models/user');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/ecoride';

console.log('Connecting to MONGO:', MONGO);

mongoose.connect(MONGO)
  .then(async () => {
    console.log('MongoDB connected');

    // Find or create a user
    let user = await User.findOne();
    if (!user) {
      console.log('Creating a test user...');
      user = await User.create({
        name: 'Test User',
        email: 'test@glbitm.ac.in',
        password: 'password123',
        role: 'driver'
      });
    }

    try {
      console.log('Attempting to create a ride...');
      const ride = await Ride.create({
        from: 'College Gate 1',
        to: 'Metro Station',
        date: '2026-06-26',
        time: '14:30',
        seats: 3,
        postedBy: user._id
      });
      console.log('Ride created successfully!', ride);
    } catch (err) {
      console.error('FAILED TO CREATE RIDE:', err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(e => {
    console.error('Connection failed:', e);
  });
