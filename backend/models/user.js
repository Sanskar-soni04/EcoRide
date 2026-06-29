// backend/models/User.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  type:   { type: String, default: 'Car' },
  model:  { type: String, default: '' },
  number: { type: String, default: '' },
  color:  { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true },
  phone:      { type: String, default: '' },
  role:       { type: String, enum: ['driver', 'passenger'], default: 'passenger' },
  vehicle:    { type: vehicleSchema, default: null },

  // Verification fields
  emailVerified:  { type: Boolean, default: false },
  phoneVerified:  { type: Boolean, default: false },

  // OTP fields (hashed)
  emailOTP:       { type: String, default: null },
  emailOTPExpiry: { type: Date, default: null },
  phoneOTP:       { type: String, default: null },
  phoneOTPExpiry: { type: Date, default: null },
  resetOTP:       { type: String, default: null },
  resetOTPExpiry: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);