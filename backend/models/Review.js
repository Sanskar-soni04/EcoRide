const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ride:      { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  from:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
