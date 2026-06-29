# 🚗🌱 EcoRide

**A campus ride-sharing platform connecting verified students for greener, cheaper commutes.**

EcoRide lets verified students carpool as drivers or passengers — cutting commute costs and carbon emissions through peer-to-peer ride sharing, built exclusively for a college community.

---

## **📖 Overview**

EcoRide is a full-stack MERN application where students with a verified **college email** (`@glbitm.ac.in`) can:
- Post rides as a **driver**
- Search and request seats as a **passenger**
- Switch roles anytime from the dashboard

The app handles everything from OTP-based email verification to live map-based ride posting, request workflows, ride history, and post-ride reviews.

This repository contains both the **backend** (Node/Express) and **frontend** (React/Vite).

---

## **✨ Features**

### 🔐 Authentication & Verification
- Registration restricted to college email domain (`glbitm.ac.in`)
- Email OTP verification after signup (OTP hashed, 10-minute expiry, resend supported)
- JWT-based login
- Forgot password / reset password via OTP

### 🔄 Role-Based Experience
- Single account, dual roles — toggle between **Driver** and **Passenger** mode right from the dashboard
- Protected routes for authenticated users only

### 🚙 Ride Creation & Management (Driver)
- Post a ride with pickup, destination, date, time, and seat count
- Interactive **Leaflet map** with a draggable pickup pin
- Reverse geocoding (pin → readable address) and location autocomplete via **Nominatim/OpenStreetMap**
- Edit, cancel, complete, or delete rides (owner-only, with active-ride restrictions)
- Completing a ride auto-completes all accepted requests tied to it

### 🔍 Ride Discovery & Requests (Passenger)
- Search rides by `from`, `to`, and optional `date`, with pagination
- Request a seat (with optional message to the driver)
- Cancel pending requests anytime

### ✅ Request Workflow (Driver)
- View pending seat requests on your posted rides
- Accept (auto-decrements available seats) or reject requests

### 📜 History & Reviews
- Ride history split by role — completed rides as driver vs. as passenger
- Leave a rating (1–5) and optional comment after a completed ride
- Only actual ride participants can review; duplicate reviews are blocked

### 👤 Profile
- View/update name, phone, and vehicle details (with optional password change)
- Profile stats: average rating, total rides as driver, total rides as passenger

### 🎨 UI Highlights
- Toast notifications for key actions
- Auto-refreshing dashboard for new requests
- Smooth UI animations via Framer Motion
- Map-assisted ride posting for a smoother UX

---

## **🛠️ Tech Stack**

### Frontend
| Tech | Purpose |
|---|---|
| React 19 | UI library |
| Vite | Build tool / dev server |
| react-router-dom | Routing |
| axios | API client |
| react-hook-form | Form handling |
| react-toastify | Toast notifications |
| framer-motion | UI animations |
| Leaflet (via CDN) | Interactive map |
| OpenStreetMap / Nominatim | Location autocomplete & reverse geocoding |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express.js | Server & routing |
| MongoDB + Mongoose | Database & ODM |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |
| Nodemailer | Email OTP delivery |
| dotenv | Environment variables |
| cors | Cross-origin handling |
| nodemon | Dev hot-reload |

### Core Data Models
- **User** — driver/passenger info, vehicle (if driver), verification flags, OTP hash + expiry
- **Ride** — route, date/time, seats, status (`active` / `completed` / `cancelled`)
- **RideRequest** — passenger request status (`pending` / `accepted` / `rejected` / `completed`)
- **Review** — 1–5 rating + comment between two users for a completed ride

---

## **📁 Project Structure**

```
EcoRide/
├── backend/
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # User, Ride, RideRequest, Review
│   ├── routes/            # auth, rides, profile
│   ├── services/          # Email (OTP) service
│   └── index.js           # Server entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/    # Header, RideCard, ProtectedRoute, etc.
│       ├── pages/         # Home, Login, Register, Dashboard, Search, etc.
│       ├── api.js         # Axios API client
│       └── main.jsx       # App entry point
└── README.md
```

---

## **🚀 Getting Started**

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (local instance or Atlas cluster)

### 1. Clone the repository
```bash
git clone https://github.com/Sanskar-soni04/EcoRide.git
cd EcoRide
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```bash
MONGO_URI=mongodb://localhost:27017/ecoride
JWT_SECRET=your_jwt_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```
> 💡 If using Gmail, you'll need an **App Password** (not your regular password) — this requires 2-Step Verification enabled on the Google account. See [Google's App Passwords guide](https://support.google.com/accounts/answer/185833).

Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend should now be running (default Vite port `5173`), connected to your backend.

---

## **📡 API Overview**

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in, returns JWT |
| POST | `/api/auth/send-otp` | Send/resend email OTP |
| POST | `/api/auth/verify-email` | Verify email with OTP |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |

### Rides
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rides` | Search/list rides (filters + pagination) |
| POST | `/api/rides` | Create a ride |
| GET | `/api/rides/my` | Get rides you've posted (driver) |
| GET | `/api/rides/my-requests` | Get your seat requests (passenger) |
| GET | `/api/rides/requests-for-me` | Get pending requests on your rides (driver) |
| PUT | `/api/rides/:id` | Edit a ride (owner, active only) |
| PUT | `/api/rides/:id/complete` | Mark ride completed (owner) |
| PUT | `/api/rides/:id/cancel` | Cancel a ride (owner) |
| DELETE | `/api/rides/:id` | Delete a ride (owner) |

### Seat Requests
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rides/:id/request` | Request a seat on a ride |
| PUT | `/api/rides/request/:reqId/accept` | Accept a seat request (driver) |
| PUT | `/api/rides/request/:reqId/reject` | Reject a seat request (driver) |
| DELETE | `/api/rides/request/:reqId/cancel` | Cancel your pending request |

### Reviews & History
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rides/:id/review` | Submit a review for a completed ride |
| GET | `/api/rides/:id/reviews` | Get reviews for a ride |
| GET | `/api/rides/history` | Get your ride history (driver + passenger) |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile` | Get your profile |
| PUT | `/api/profile` | Update your profile |
| GET | `/api/profile/reviews` | Get reviews you've received |
| GET | `/api/profile/:userId` | Get another user's public profile |

---

## **🧪 Quick Manual Test Flow**

1. Register with a `glbitm.ac.in` email
2. Verify your email using the OTP sent to your inbox
3. Log in
4. Pick a role:
   - **Driver** → post a ride → accept seat requests → mark ride complete → leave reviews
   - **Passenger** → search rides → request a seat → optionally cancel → rate completed rides

---

## **🔒 Notes**

- All ride and request endpoints require JWT authentication.
- OTPs are stored hashed (never in plaintext) and expire after 10 minutes.
- Map and location autocomplete rely on public OpenStreetMap/Nominatim services.
- `.env` files are **excluded from version control** — create them locally using the examples above before running the project.

---

## **🤝 Contributing**

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

Built with ❤️ for campus commuters who'd rather split a ride than split fare app screenshots.