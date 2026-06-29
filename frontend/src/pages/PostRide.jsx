// src/pages/PostRide.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";

// ── Autocomplete hook using Nominatim ─────────────────────────────────────────
function useLocationSuggest(query) {
  const [suggestions, setSuggestions] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    if (!query || query.length < 3) { setSuggestions([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await r.json();
        setSuggestions(data.map(d => ({
          label: d.display_name.split(',').slice(0, 4).join(', '),
          full:  d.display_name,
          lat:   parseFloat(d.lat),
          lng:   parseFloat(d.lon),
        })));
      } catch { setSuggestions([]); }
    }, 400);
    return () => clearTimeout(timer.current);
  }, [query]);

  return { suggestions, clear: () => setSuggestions([]) };
}

// ── Location input with dropdown suggestions ──────────────────────────────────
function LocationInput({ label, icon, value, onChange, onSelect, placeholder, addonBtn }) {
  const { suggestions, clear } = useLocationSuggest(value);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) clear(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showDrop = focused && suggestions.length > 0;

  return (
    <div className="field-group" ref={wrapRef} style={{ position: 'relative' }}>
      <label className="field-label">{label}</label>
      <div className={`field-row ${showDrop ? 'open' : ''}`}>
        <span className="field-icon">{icon}</span>
        <input
          className="field-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          autoComplete="off"
        />
        {addonBtn}
      </div>
      {showDrop && (
        <div className="suggest-drop">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="suggest-item"
              onMouseDown={() => { onSelect(s); clear(); }}
            >
              <span className="suggest-pin">📍</span>
              <span className="suggest-text">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PostRide() {
  const navigate   = useNavigate();
  const { rideId } = useParams();
  const mapRef     = useRef(null);
  const leafletMap = useRef(null);
  const markerRef  = useRef(null);

  const isEdit = !!rideId;

  const [from,       setFrom]       = useState("");
  const [to,         setTo]         = useState("");
  const [date,       setDate]       = useState("");
  const [time,       setTime]       = useState("");
  const [seats,      setSeats]      = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [mapReady,   setMapReady]   = useState(false);

  // ── Load existing ride for edit mode ──────────────────────────────────────
  useEffect(() => {
    if (!rideId) return;
    (async () => {
      try {
        const { data } = await api.get('/rides');
        const ride = data.find(r => r._id === rideId);
        if (ride) {
          setFrom(ride.from);
          setTo(ride.to);
          setDate(ride.date);
          setTime(ride.time);
          setSeats(ride.seats);
        }
      } catch { setMsg({ type: 'error', text: 'Failed to load ride' }); }
    })();
  }, [rideId]);

  // ── Leaflet bootstrap ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const l = document.createElement('link');
      l.id = 'leaflet-css'; l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    if (window.L) { initMap(); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => { initMap(); fetchCurrentLocation(); };
    document.head.appendChild(s);
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  const greenIcon = () => window.L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#00e676;
            border:3px solid #050a0e;box-shadow:0 0 0 4px rgba(0,230,118,0.3)"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9],
  });

  const initMap = (lat = 28.6139, lng = 77.209) => {
    if (!mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true });
    leafletMap.current = map;
    setMapReady(true);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker([lat, lng], { icon: greenIcon(), draggable: true }).addTo(map);
    markerRef.current = marker;
    map.setView([lat, lng], 13);

    marker.on('dragend', async (e) => {
      const { lat: la, lng: lo } = e.target.getLatLng();
      const name = await reverseGeocode(la, lo);
      if (name) setFrom(name);
    });

    map.on('click', async (e) => {
      const { lat: la, lng: lo } = e.latlng;
      marker.setLatLng([la, lo]);
      const name = await reverseGeocode(la, lo);
      if (name) setFrom(name);
    });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const d = await r.json();
      return d.display_name?.split(',').slice(0, 3).join(', ') || '';
    } catch { return ''; }
  };

  const moveMapTo = (lat, lng) => {
    if (!leafletMap.current) return;
    leafletMap.current.setView([lat, lng], 15);
    markerRef.current?.setLatLng([lat, lng]);
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        moveMapTo(lat, lng);
        const name = await reverseGeocode(lat, lng);
        if (name) setFrom(name);
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { timeout: 8000 }
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!from.trim() || !to.trim() || !date || !time) {
      setMsg({ type: 'error', text: 'Please fill all fields correctly.' });
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/rides/${rideId}`, { from, to, date, time, seats });
        setMsg({ type: 'success', text: 'Ride updated! Redirecting…' });
      } else {
        await api.post('/rides', { from, to, date, time, seats });
        setMsg({ type: 'success', text: '🎉 Ride posted! Redirecting to dashboard…' });
      }
      setTimeout(() => navigate('/dashboard'), 1600);
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to post ride.';
      setMsg({ type: 'error', text: errMsg });
      if (err?.response?.status === 401) {
        setTimeout(() => navigate('/login'), 1500);
      }
    }
    setLoading(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .pr-page {
          min-height: 100vh;
          background: #050a0e;
          color: #e8f4f0;
          font-family: 'DM Sans', sans-serif;
          padding: 48px 24px 80px;
        }

        .pr-inner { max-width: 1100px; margin: 0 auto; }

        .pr-header { margin-bottom: 36px; }
        .pr-header h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .pr-header h1 span { color: #00e676; }
        .pr-header p { color: rgba(232,244,240,0.45); font-size: 15px; font-weight: 300; }

        .pr-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        @media(max-width: 820px) { .pr-grid { grid-template-columns: 1fr; } }

        /* ── FORM PANEL ── */
        .pr-form-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .field-group { display: flex; flex-direction: column; gap: 7px; }

        .field-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232,244,240,0.4);
        }

        .field-row {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          overflow: visible;
          transition: border-color 0.2s;
        }
        .field-row:focus-within, .field-row.open { border-color: rgba(0,230,118,0.45); }

        .field-icon {
          padding: 0 13px;
          color: rgba(232,244,240,0.3);
          font-size: 15px;
          flex-shrink: 0;
        }

        .field-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e8f4f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          padding: 13px 12px 13px 0;
        }
        .field-input::placeholder { color: rgba(232,244,240,0.2); }
        .field-input::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }

        /* Autocomplete dropdown */
        .suggest-drop {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: #0f1c24;
          border: 1px solid rgba(0,230,118,0.2);
          border-radius: 14px;
          overflow: hidden;
          z-index: 9999;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }

        .suggest-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 16px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .suggest-item:last-child { border-bottom: none; }
        .suggest-item:hover { background: rgba(0,230,118,0.08); }

        .suggest-pin { font-size: 13px; flex-shrink: 0; margin-top: 1px; }
        .suggest-text { font-size: 13px; color: rgba(232,244,240,0.8); line-height: 1.4; }

        /* Loc button */
        .loc-btn {
          background: rgba(0,230,118,0.1);
          border: none;
          border-left: 1px solid rgba(255,255,255,0.08);
          color: #00e676;
          padding: 0 14px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          height: 100%;
          min-height: 48px;
          display: flex; align-items: center; gap: 6px;
          transition: background 0.2s;
          border-radius: 0 14px 14px 0;
        }
        .loc-btn:hover { background: rgba(0,230,118,0.18); }
        .loc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Two-col */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* Seats */
        .seats-wrap { display: flex; flex-direction: column; gap: 10px; }
        .seats-label-row { display: flex; justify-content: space-between; align-items: center; }
        .seats-count { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #00e676; }
        .seats-slider { width: 100%; accent-color: #00e676; cursor: pointer; }
        .seats-dots { display: flex; gap: 8px; flex-wrap: wrap; }
        .seat-dot {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
        }
        .seat-dot.active { background: rgba(0,230,118,0.15); border-color: #00e676; transform: scale(1.05); }

        /* Message */
        .pr-msg {
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
        }
        .pr-msg.success { background: rgba(0,230,118,0.1); color: #00e676; border: 1px solid rgba(0,230,118,0.2); }
        .pr-msg.error   { background: rgba(239,83,80,0.1);  color: #ef5350; border: 1px solid rgba(239,83,80,0.2); }

        /* Buttons */
        .btn-row { display: flex; gap: 12px; margin-top: 4px; }
        .btn-submit {
          flex: 1;
          background: #00e676;
          color: #050a0e;
          border: none;
          padding: 14px 24px;
          border-radius: 50px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s;
        }
        .btn-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,230,118,0.35); }
        .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-reset {
          background: transparent;
          color: rgba(232,244,240,0.45);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 14px 20px;
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-reset:hover { border-color: rgba(239,83,80,0.3); color: #ef9a9a; }

        /* ── RIGHT PANEL ── */
        .pr-right { display: flex; flex-direction: column; gap: 22px; }

        /* Map */
        .map-wrap {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          height: 270px;
          position: relative;
          background: #0d1b24;
        }
        #pr-map { height: 100%; width: 100%; }

        .map-badge {
          position: absolute;
          top: 12px; left: 12px;
          z-index: 1000;
          background: rgba(5,10,14,0.88);
          border: 1px solid rgba(0,230,118,0.25);
          color: #00e676;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 5px 12px;
          border-radius: 100px;
          text-transform: uppercase;
          backdrop-filter: blur(6px);
        }

        .map-loading {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          background: #0d1b24;
          z-index: 999;
          color: rgba(232,244,240,0.3);
          font-size: 14px;
          transition: opacity 0.5s;
          pointer-events: none;
        }
        .map-loading.hidden { opacity: 0; }
        .bounce { font-size: 2.2rem; animation: bounce 1.4s ease-in-out infinite; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        /* Preview card */
        .preview-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px;
        }
        .preview-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .preview-top h3 { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; }
        .preview-top p { font-size: 12px; color: rgba(232,244,240,0.3); margin-top: 2px; }

        .status-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(0,230,118,0.1);
          border: 1px solid rgba(0,230,118,0.2);
          color: #00e676;
          font-size: 11px; font-weight: 600;
          padding: 4px 12px; border-radius: 100px;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #00e676; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

        .preview-route {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 16px; margin-bottom: 14px;
        }
        .pr-loc { flex: 1; }
        .pr-loc .lbl { font-size: 10px; color: rgba(232,244,240,0.3); margin-bottom: 4px; letter-spacing: 0.08em; text-transform: uppercase; }
        .pr-loc .val { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; word-break: break-word; }
        .pr-loc .val.empty { color: rgba(232,244,240,0.2); font-family: 'DM Sans', sans-serif; font-weight: 300; font-style: italic; }
        .arrow-green { color: #00e676; font-size: 18px; flex-shrink: 0; }

        .preview-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .meta-item { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 10px 12px; }
        .meta-item .lbl { font-size: 10px; color: rgba(232,244,240,0.3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .meta-item .val { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
        .meta-item .val.empty { color: rgba(232,244,240,0.2); font-family: 'DM Sans',sans-serif; font-weight:300; font-style:italic; font-size:12px; }

        .preview-footer {
          display: flex; align-items: center; gap: 10px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
        }
        .preview-footer span { font-size: 12px; color: rgba(232,244,240,0.3); margin-left: auto; }

        .tip-box {
          background: rgba(38,198,218,0.05);
          border: 1px solid rgba(38,198,218,0.15);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 13px;
          color: rgba(232,244,240,0.5);
          line-height: 1.65;
        }
        .tip-box strong { color: #26c6da; }

        .leaflet-container { background: #0d1b24 !important; }
        .leaflet-tile-pane { filter: brightness(0.85) saturate(0.7); }
      `}</style>

      <div className="pr-page">
        <div className="pr-inner">

          <div className="pr-header">
            <h1>{isEdit ? 'Edit Your' : 'Post a'} <span>Ride</span></h1>
            <p>{isEdit ? 'Update your ride details below.' : 'Share your route, set seats, and help fellow students commute smarter.'}</p>
          </div>

          <div className="pr-grid">

            {/* ── FORM ── */}
            <div className="pr-form-panel">

              {msg && <div className={`pr-msg ${msg.type}`}>{msg.text}</div>}

              {/* FROM with locate btn */}
              <LocationInput
                label="Pickup location"
                icon="📍"
                value={from}
                onChange={e => setFrom(e.target.value)}
                onSelect={s => { setFrom(s.label); moveMapTo(s.lat, s.lng); }}
                placeholder="Type or detect your location"
                addonBtn={
                  <button
                    type="button"
                    className="loc-btn"
                    onClick={fetchCurrentLocation}
                    disabled={locLoading}
                  >
                    {locLoading ? '⏳' : '🎯'} {locLoading ? 'Finding…' : 'Locate me'}
                  </button>
                }
              />

              {/* TO with autocomplete */}
              <LocationInput
                label="Destination"
                icon="🏁"
                value={to}
                onChange={e => setTo(e.target.value)}
                onSelect={s => setTo(s.label)}
                placeholder="Where are you headed?"
              />

              {/* DATE + TIME */}
              <div className="two-col">
                <div className="field-group">
                  <label className="field-label">Date</label>
                  <div className="field-row">
                    <span className="field-icon">📅</span>
                    <input className="field-input" type="date" value={date} min={todayStr}
                      onChange={e => setDate(e.target.value)} required />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Time</label>
                  <div className="field-row">
                    <span className="field-icon">⏰</span>
                    <input className="field-input" type="time" value={time}
                      onChange={e => setTime(e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* SEATS */}
              <div className="field-group">
                <label className="field-label">Available seats</label>
                <div className="seats-wrap">
                  <div className="seats-label-row">
                    <span style={{ fontSize: 13, color: 'rgba(232,244,240,0.4)' }}>Drag or tap a seat</span>
                    <span className="seats-count">{seats}</span>
                  </div>
                  <input type="range" className="seats-slider" min={1} max={6} value={seats}
                    onChange={e => setSeats(Number(e.target.value))} />
                  <div className="seats-dots">
                    {[1,2,3,4,5,6].map(n => (
                      <div key={n} className={`seat-dot ${seats >= n ? 'active' : ''}`} onClick={() => setSeats(n)}>🪑</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="btn-row">
                <button className="btn-submit" onClick={submit} disabled={loading}>
                  {loading ? 'Saving…' : isEdit ? 'Update Ride →' : 'Post Ride →'}
                </button>
                <button className="btn-reset" onClick={() => { setFrom(''); setTo(''); setDate(''); setTime(''); setSeats(1); setMsg(null); }}>
                  Reset
                </button>
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="pr-right">

              {/* MAP */}
              <div className="map-wrap">
                <div className="map-badge">📍 Pickup point — click to move</div>
                <div id="pr-map" ref={mapRef} />
                <div className={`map-loading ${mapReady ? 'hidden' : ''}`}>
                  <span className="bounce">📍</span>
                  <span>Loading map…</span>
                </div>
              </div>

              {/* LIVE PREVIEW */}
              <div className="preview-card">
                <div className="preview-top">
                  <div>
                    <h3>Live Preview</h3>
                    <p>How your ride looks to others</p>
                  </div>
                  <div className="status-pill"><span className="status-dot" /> Ready</div>
                </div>

                <div className="preview-route">
                  <div className="pr-loc">
                    <div className="lbl">From</div>
                    <div className={`val ${!from ? 'empty' : ''}`}>{from || 'Your location'}</div>
                  </div>
                  <span className="arrow-green">→</span>
                  <div className="pr-loc" style={{ textAlign: 'right' }}>
                    <div className="lbl">To</div>
                    <div className={`val ${!to ? 'empty' : ''}`}>{to || 'Destination'}</div>
                  </div>
                </div>

                <div className="preview-meta">
                  <div className="meta-item">
                    <div className="lbl">Date</div>
                    <div className={`val ${!date ? 'empty' : ''}`}>{date || '—'}</div>
                  </div>
                  <div className="meta-item">
                    <div className="lbl">Time</div>
                    <div className={`val ${!time ? 'empty' : ''}`}>{time || '—'}</div>
                  </div>
                  <div className="meta-item">
                    <div className="lbl">Seats</div>
                    <div className="val">{seats}</div>
                  </div>
                </div>

                <div className="preview-footer">
                  <button style={{ background:'rgba(0,230,118,0.1)', border:'1px solid rgba(0,230,118,0.25)', color:'#00e676', padding:'7px 18px', borderRadius:'100px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Contact</button>
                  <button style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(232,244,240,0.55)', padding:'7px 18px', borderRadius:'100px', fontSize:13, cursor:'pointer' }}>Share</button>
                  <span>Posted by: You</span>
                </div>
              </div>

              <div className="tip-box">
                <strong>💡 Tips:</strong> Start typing any location to get suggestions. Click the map or drag the pin to set your exact pickup. All rides are visible to verified campus students only.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}