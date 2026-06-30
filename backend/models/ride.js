// backend/models/Ride.js — matches your existing schema, extended
const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from:        { type: String, required: true, trim: true },
  to:          { type: String, required: true, trim: true },
  date:        { type: String, required: true },   // "YYYY-MM-DD"
  time:        { type: String, required: true },   // "HH:MM"
  seats:       { type: Number, required: true, min: 0, max: 8 },
  passengers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);