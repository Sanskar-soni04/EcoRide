// backend/routes/rides.js
const express      = require('express');
const router       = express.Router();
const Ride         = require('../models/ride');
const RideRequest  = require('../models/RideRequest');
const Review       = require('../models/Review');
const auth         = require('../middleware/auth');

// ── GET /api/rides/my — rides posted by logged-in driver ─────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const rides = await Ride.find({ postedBy: req.user.userId }).sort({ date: -1 });
    // attach pending request count to each ride
    const ridesWithCounts = await Promise.all(rides.map(async ride => {
      const pendingCount = await RideRequest.countDocuments({ ride: ride._id, status: 'pending' });
      return { ...ride.toObject(), pendingRequests: pendingCount };
    }));
    res.json(ridesWithCounts);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── GET /api/rides/my-requests — requests made by logged-in passenger ────────
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await RideRequest.find({ passenger: req.user.userId })
      .populate({ path: 'ride', populate: { path: 'postedBy', select: 'name email phone' } })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── GET /api/rides/requests-for-me — all requests on driver's rides ──────────
router.get('/requests-for-me', auth, async (req, res) => {
  try {
    const myRides = await Ride.find({ postedBy: req.user.userId }).select('_id');
    const rideIds = myRides.map(r => r._id);
    const requests = await RideRequest.find({ ride: { $in: rideIds }, status: 'pending' })
      .populate('passenger', 'name email phone vehicle')
      .populate('ride')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── GET /api/rides — search / list all rides ─────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const filter = { status: 'active', seats: { $gt: 0 } };
    if (req.query.from) filter.from = { $regex: escapeRegex(req.query.from), $options: 'i' };
    if (req.query.to)   filter.to   = { $regex: escapeRegex(req.query.to),   $options: 'i' };
    if (req.query.date) filter.date = req.query.date;

    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .populate('postedBy', 'name email phone vehicle')
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limit),
      Ride.countDocuments(filter),
    ]);

    // Attach average rating for each driver
    const driverIds = [...new Set(rides.map(r => r.postedBy?._id?.toString()).filter(Boolean))];
    const ratingMap = {};
    if (driverIds.length > 0) {
      const reviews = await Review.aggregate([
        { $match: { to: { $in: driverIds.map(id => new (require('mongoose').Types.ObjectId)(id)) } } },
        { $group: { _id: '$to', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      reviews.forEach(r => { ratingMap[r._id.toString()] = { avg: r.avg, count: r.count }; });
    }

    const ridesWithRating = rides.map(r => {
      const obj = r.toObject();
      const driverId = obj.postedBy?._id?.toString();
      if (driverId && ratingMap[driverId]) {
        obj.postedBy = { ...obj.postedBy, avgRating: parseFloat(ratingMap[driverId].avg.toFixed(1)), totalReviews: ratingMap[driverId].count };
      }
      return obj;
    });

    res.json({ rides: ridesWithRating, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── POST /api/rides — create a ride ──────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { from, to, date, time, seats } = req.body;
    if (!from || !to || !date || !time)
      return res.status(400).json({ message: 'All fields required' });
    const ride = await Ride.create({
      from, to, date, time,
      seats: seats || 1,
      postedBy: req.user.userId,
    });
    res.status(201).json(ride);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── POST /api/rides/:id/request — passenger requests a seat ──────────────────
router.post('/:id/request', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.postedBy.toString() === req.user.userId)
      return res.status(400).json({ message: "You can't request your own ride" });
    if (ride.status !== 'active')
      return res.status(400).json({ message: 'This ride is no longer active' });
    if (ride.seats < 1)
      return res.status(400).json({ message: 'No seats available on this ride' });

    // prevent duplicate requests
    const existing = await RideRequest.findOne({
      ride: ride._id,
      passenger: req.user.userId,
      status: 'pending',
    });
    if (existing) return res.status(400).json({ message: 'Request already sent' });

    const request = await RideRequest.create({
      ride:      ride._id,
      passenger: req.user.userId,
      driver:    ride.postedBy,
      message:   req.body.message || '',
    });

    res.status(201).json(request);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── PUT /api/rides/request/:reqId/accept — driver accepts ────────────────────
router.put('/request/:reqId/accept', auth, async (req, res) => {
  try {
    const request = await RideRequest.findById(req.params.reqId).populate('ride');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.driver.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });
    if (request.ride.seats < 1)
      return res.status(400).json({ message: 'No seats available' });

    request.status = 'accepted';
    await request.save();

    // decrement available seats (atomic update, bypasses full-doc validation)
    await Ride.findByIdAndUpdate(
      request.ride._id,
      { $inc: { seats: -1 } },
      { runValidators: false }
    );

    res.json({ message: 'Request accepted', request });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── PUT /api/rides/request/:reqId/reject — driver rejects ────────────────────
router.put('/request/:reqId/reject', auth, async (req, res) => {
  try {
    const request = await RideRequest.findById(req.params.reqId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.driver.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });

    request.status = 'rejected';
    await request.save();
    res.json({ message: 'Request rejected', request });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── DELETE /api/rides/request/:reqId/cancel — passenger cancels a pending request ─
router.delete('/request/:reqId/cancel', auth, async (req, res) => {
  try {
    const request = await RideRequest.findOne({ _id: req.params.reqId, passenger: req.user.userId, status: 'pending' });
    if (!request) return res.status(404).json({ message: 'Pending request not found' });
    await request.deleteOne();
    res.json({ message: 'Request cancelled' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── PUT /api/rides/:id — edit a ride (owner only) ─────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findOne({ _id: req.params.id, postedBy: req.user.userId });
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.status !== 'active') return res.status(400).json({ message: 'Can only edit active rides' });

    const { from, to, date, time, seats } = req.body;
    if (from)  ride.from  = from;
    if (to)    ride.to    = to;
    if (date)  ride.date  = date;
    if (time)  ride.time  = time;
    if (seats !== undefined) ride.seats = seats;

    await ride.save();
    res.json({ message: 'Ride updated', ride });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── PUT /api/rides/:id/complete — mark ride as completed (owner only) ─────────
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const existing = await Ride.findOne({ _id: req.params.id, postedBy: req.user.userId });
    if (!existing) return res.status(404).json({ message: 'Ride not found' });
    if (existing.status !== 'active') return res.status(400).json({ message: 'Ride already completed or cancelled' });

    // Only update the status field — avoids re-validating seats (which may
    // legitimately be 0 once fully booked) via a full document .save().
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true, runValidators: false }
    );

    // Also mark all accepted ride requests as completed
    await RideRequest.updateMany(
      { ride: ride._id, status: 'accepted' },
      { status: 'completed' }
    );

    res.json({ message: 'Ride marked as completed', ride });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── GET /api/rides/history — completed rides for current user (driver + passenger) ─
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Rides where user was the driver and ride is completed
    const driverRides = await Ride.find({ postedBy: userId, status: 'completed' })
      .sort({ date: -1 });

    // Requests where user was passenger and status is completed (ride finished)
    const passengerRequests = await RideRequest.find({
      passenger: userId,
      status: { $in: ['accepted', 'completed'] },
    })
      .populate({ path: 'ride', match: { status: 'completed' } })
      .sort({ createdAt: -1 });

    // Filter out rides that aren't actually completed (populate returns null if match fails)
    const completedPassenger = passengerRequests
      .filter(r => r.ride)
      .map(r => ({
        _id: r.ride._id,
        from: r.ride.from,
        to: r.ride.to,
        date: r.ride.date,
        time: r.ride.time,
        postedBy: r.ride.postedBy,
        requestId: r._id,
        role: 'passenger',
      }));

    const driverData = driverRides.map(r => ({
      _id: r._id,
      from: r.from,
      to: r.to,
      date: r.date,
      time: r.time,
      seats: r.seats,
      postedBy: userId,
      role: 'driver',
    }));

    // Fetch reviews already given by this user for any of these rides
    const allRideIds = [...driverData.map(r => r._id), ...completedPassenger.map(r => r._id)];
    const myReviews = await Review.find({ from: userId, ride: { $in: allRideIds } }).select('ride rating');

    const reviewMap = {};
    myReviews.forEach(r => { reviewMap[r.ride.toString()] = r.rating; });

    // Attach reviewed status
    const combined = [...driverData, ...completedPassenger].map(r => ({
      ...r,
      reviewed: !!reviewMap[r._id.toString()],
      myRating: reviewMap[r._id.toString()] || null,
    }));

    res.json(combined);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── PUT /api/rides/:id/cancel — cancel an active ride (owner only) ─────────────
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const existing = await Ride.findOne({ _id: req.params.id, postedBy: req.user.userId });
    if (!existing) return res.status(404).json({ message: 'Ride not found' });
    if (existing.status !== 'active') return res.status(400).json({ message: 'Can only cancel active rides' });

    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: false }
    );

    // Reject all pending requests for this ride
    await RideRequest.updateMany(
      { ride: ride._id, status: 'pending' },
      { status: 'rejected' }
    );

    res.json({ message: 'Ride cancelled', ride });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── DELETE /api/rides/:id ─────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findOne({ _id: req.params.id, postedBy: req.user.userId });
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    await ride.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── POST /api/rides/:id/review — submit a review for a completed ride ─────────
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.status !== 'completed')
      return res.status(400).json({ message: 'Can only review completed rides' });

    // Check user was part of this ride
    const isDriver = ride.postedBy.toString() === req.user.userId;
    const isPassenger = await RideRequest.exists({
      ride: ride._id,
      passenger: req.user.userId,
      status: { $in: ['accepted', 'completed'] },
    });

    if (!isDriver && !isPassenger)
      return res.status(403).json({ message: 'You were not part of this ride' });

    // Determine who is being reviewed (the other party)
    let toUser;
    if (isDriver) {
      // Driver is reviewing a passenger — we can just pick from ride passengers
      const accepted = await RideRequest.findOne({
        ride: ride._id,
        status: { $in: ['accepted', 'completed'] },
      }).populate('passenger');
      if (!accepted) return res.status(400).json({ message: 'No accepted passengers to review' });
      toUser = accepted.passenger._id;
    } else {
      toUser = ride.postedBy;
    }

    // Check duplicate review
    const existing = await Review.findOne({ ride: ride._id, from: req.user.userId, to: toUser });
    if (existing)
      return res.status(400).json({ message: 'You already reviewed this ride' });

    const review = await Review.create({
      ride: ride._id,
      from: req.user.userId,
      to: toUser,
      rating,
      comment: comment || '',
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// ── GET /api/rides/:id/reviews — get reviews for a ride ───────────────────────
router.get('/:id/reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ ride: req.params.id })
      .populate('from', 'name')
      .populate('to', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;