const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Review = require('../models/Review');
const Ride = require('../models/ride');
const RideRequest = require('../models/RideRequest');
const auth = require('../middleware/auth');

// GET /api/profile — get current user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -emailOTP -emailOTPExpiry -phoneOTP -phoneOTPExpiry -resetOTP -resetOTPExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate average rating
    const reviewsReceived = await Review.find({ to: user._id });
    const avgRating = reviewsReceived.length > 0
      ? (reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsReceived.length).toFixed(1)
      : null;

    // Count rides as driver
    const ridesAsDriver = await Ride.countDocuments({ postedBy: user._id, status: 'completed' });

    // Count rides as passenger
    const ridesAsPassenger = await RideRequest.countDocuments({
      passenger: user._id,
      status: { $in: ['accepted', 'completed'] },
    });

    res.json({
      ...user.toObject(),
      avgRating: avgRating ? parseFloat(avgRating) : null,
      totalReviews: reviewsReceived.length,
      ridesAsDriver,
      ridesAsPassenger,
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile — update current user profile
router.put('/', auth, async (req, res) => {
  try {
    const { name, phone, vehicle, password } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (phone) update.phone = phone.trim();
    if (vehicle) update.vehicle = vehicle;
    if (password && password.length >= 6)
      update.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true })
      .select('-password -emailOTP -emailOTPExpiry -phoneOTP -phoneOTPExpiry -resetOTP -resetOTPExpiry');
    res.json({ message: 'Profile updated', user });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/profile/reviews — get reviews for current user
router.get('/reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ to: req.user.userId })
      .populate('from', 'name email')
      .populate('ride', 'from to date time')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ reviews, avgRating: avgRating ? parseFloat(avgRating) : null, total: reviews.length });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/profile/:userId — get a public user profile
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email phone role vehicle createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reviewsReceived = await Review.find({ to: user._id });
    const avgRating = reviewsReceived.length > 0
      ? (reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsReceived.length).toFixed(1)
      : null;

    const ridesAsDriver = await Ride.countDocuments({ postedBy: user._id, status: 'completed' });

    res.json({
      ...user.toObject(),
      avgRating: avgRating ? parseFloat(avgRating) : null,
      totalReviews: reviewsReceived.length,
      ridesAsDriver,
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
