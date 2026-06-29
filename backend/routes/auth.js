const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const { sendOTP } = require('../services/email');

const allowedDomains = ['glbitm.ac.in'];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ----------------------- REGISTER -----------------------
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, vehicle, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    email = String(email).trim().toLowerCase();

    const parts = email.split('@');
    const domain = parts.length === 2 ? parts[1] : '';

    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({ message: 'College email required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hash,
      role: role || 'passenger',
      vehicle,
    });

    await user.save();

    // Generate and send OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    user.emailOTP = hashedOTP;
    user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTP(email, otp, 'Verify your EcoRide email', 'Use this code to verify your EcoRide account:');
    } catch (emailErr) {
      console.error('EMAIL SEND FAILED (non-blocking):', emailErr.message);
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '12h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'passenger',
        vehicle: user.vehicle || null,
        emailVerified: user.emailVerified,
      }
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------- SEND EMAIL OTP -----------------------
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    user.emailOTP = hashedOTP;
    user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP(email, otp, 'EcoRide Email Verification', 'Your email verification code:');

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('SEND OTP ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------- VERIFY EMAIL OTP -----------------------
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.emailVerified) {
      return res.json({ message: 'Email already verified' });
    }

    if (!user.emailOTP || !user.emailOTPExpiry) {
      return res.status(400).json({ message: 'No OTP requested. Request a new one.' });
    }

    if (new Date() > user.emailOTPExpiry) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    const valid = await bcrypt.compare(otp, user.emailOTP);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

    user.emailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpiry = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('VERIFY EMAIL ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------- FORGOT PASSWORD -----------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    user.resetOTP = hashedOTP;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP(email, otp, 'EcoRide Password Reset', 'Use this code to reset your EcoRide password:');

    res.json({ message: 'Reset OTP sent' });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------- RESET PASSWORD -----------------------
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and new password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: 'No reset requested. Request a new OTP.' });
    }

    if (new Date() > user.resetOTPExpiry) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    const valid = await bcrypt.compare(otp, user.resetOTP);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

    user.password = await bcrypt.hash(password, 10);
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------- LOGIN -----------------------
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    email = String(email).trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'passenger',
        vehicle: user.vehicle || null,
        phone: user.phone || '',
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      }
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
