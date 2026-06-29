// backend/index.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const mongoose  = require('mongoose');
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');

const authRoutes  = require('./routes/auth');
const rideRoutes  = require('./routes/rides');
const profileRoutes = require('./routes/profile');
const User        = require('./models/user');

const app  = express();
app.use(cors());

// Keep express.json with rawBody capture (your existing pattern)
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf ? buf.toString('utf8') : undefined; }
}));

// Light request logger (your existing pattern)
app.use((req, res, next) => {
  if (['POST','PUT','PATCH'].includes(req.method)) {
    let safe = req.rawBody;
    if (safe) {
      try { const parsed = JSON.parse(safe); if (parsed.password) parsed.password = '***'; safe = JSON.stringify(parsed); } catch {}
    }
    console.log('REQ', req.method, req.originalUrl, 'BODY:', safe);
  }
  next();
});

// ── Auth middleware (reused for profile routes) ───────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'secret');
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
}

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/rides',   rideRoutes);
app.use('/api/profile', profileRoutes);

// ── Profile ───────────────────────────────────────────────
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

app.put('/api/profile', auth, async (req, res) => {
  try {
    const { name, phone, vehicle, password } = req.body;
    const update = {};
    if (name)    update.name    = name.trim();
    if (phone)   update.phone   = phone.trim();
    if (vehicle) update.vehicle = vehicle;
    if (password && password.length >= 6)
      update.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// ── Health & Root ─────────────────────────────────────────
app.get('/',          (_, res) => res.send('EcoRide Backend Running'));
app.get('/api/health',(_, res) => res.json({ status: 'ok' }));

// ── Connect & Start ───────────────────────────────────────
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/ecoride';
const PORT  = process.env.PORT || 5000;

mongoose.connect(MONGO)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log('Server listening on', PORT));
  })
  .catch(e => { console.error(e); process.exit(1); });