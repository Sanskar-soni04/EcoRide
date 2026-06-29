// backend/models/RideRequest.js
const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
  ride:      { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message:   { type: String, default: '' },
  status:    { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('RideRequest', rideRequestSchema);
