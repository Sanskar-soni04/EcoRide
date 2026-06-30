// src/pages/Search.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function trim(str, n=3){ return str?(str.split(',').map(s=>s.trim()).slice(0,n).join(', ')):'' }

// ── Autocomplete hook using Nominatim (same as PostRide) ───────────────────
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

// ── Location input with dropdown suggestions ────────────────────────────────
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
    <div className="sf" ref={wrapRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <div className={`sf-row ${showDrop ? 'open' : ''}`}>
        {icon && <span className="sf-icon">{icon}</span>}
        <input
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
            <div key={i} className="suggest-item" onMouseDown={() => { onSelect(s); clear(); }}>
              <span className="suggest-pin">📍</span>
              <span className="suggest-text">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RequestModal({ride,onClose}){
  const [msg,setMsg]=useState('');const [sent,setSent]=useState(false);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
  const send=async()=>{
    setLoading(true);setError('');
    try{
      await api.post('/rides/'+ride._id+'/request',{message:msg});
      setSent(true);
    }catch(e){
      setError(e?.response?.data?.message || 'Failed to send request. Please try again.');
    }
    setLoading(false);
  };
  return(
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mb">
        {!sent?<>
          <div className="mh"><div><h3>Request this ride</h3><p>Send a note to the driver</p></div><button className="mc" onClick={onClose}>✕</button></div>
          <div className="mroute">
            <div className="mrl"><div className="mrl-lbl">From</div><div className="mrl-val">{trim(ride.from)}</div></div>
            <span style={{color:'#00e676',fontSize:20}}>→</span>
            <div className="mrl" style={{textAlign:'right'}}><div className="mrl-lbl">To</div><div className="mrl-val">{trim(ride.to)}</div></div>
          </div>
          <div className="mmeta">
            <span className="mpill">📅 {new Date(ride.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
            {ride.time&&<span className="mpill">🕐 {ride.time}</span>}
            <span className="mpill">💺 {ride.seats} seat{ride.seats!==1?'s':''}</span>
            {ride.postedBy?.name&&<span className="mpill">👤 {ride.postedBy.name}</span>}
          </div>
          <div className="mlbl">Message (optional)</div>
          <textarea className="mta" placeholder="Hi! I'd like to join your ride." value={msg} onChange={e=>setMsg(e.target.value)}/>
          {error&&<div style={{color:'#ff8a80',background:'rgba(239,83,80,0.1)',border:'1px solid rgba(239,83,80,0.25)',borderRadius:10,padding:'10px 14px',fontSize:13,marginTop:10}}>{error}</div>}
          <div className="mbtns">
            <button className="mbsend" onClick={send} disabled={loading}>{loading?'Sending…':'🚗 Request Seat'}</button>
            <button className="mbcancel" onClick={onClose}>Cancel</button>
          </div>
        </>:<div style={{textAlign:'center',padding:'16px 0'}}>
          <div style={{fontSize:'3rem',marginBottom:12}}>🎉</div>
          <h4 style={{fontFamily:'Plus Jakarta Sans',fontWeight:800,color:'#00e676',fontSize:'1.1rem',marginBottom:8}}>Request sent!</h4>
          <p style={{fontSize:14,color:'rgba(232,244,240,0.5)',lineHeight:1.65}}>The driver will confirm your seat shortly.</p>
          {ride.postedBy?.email&&<div className="creveal"><p>Driver contact</p><strong>{ride.postedBy.email}</strong></div>}
          <button className="mbsend" style={{marginTop:20,width:'100%'}} onClick={onClose}>Done ✓</button>
        </div>}
      </div>
    </div>
  );
}

export default function Search(){
  const navigate = useNavigate();
  const [from,setFrom]=useState('');const [to,setTo]=useState('');const [date,setDate]=useState('');
  const [rides,setRides]=useState([]);const [loading,setLoading]=useState(false);const [searched,setSearched]=useState(false);const [selected,setSelected]=useState(null);
  const [locLoading,setLocLoading]=useState(false);
  const [mapReady,setMapReady]=useState(false);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const fromMarker = useRef(null);
  const toMarker = useRef(null);

  const fetchRides=async(params={})=>{setLoading(true);setSearched(true);try{const{data}=await api.get('/rides',{params});setRides(Array.isArray(data)?data:(data.rides||[]));}catch{setRides([]);}finally{setLoading(false);}};
  useEffect(()=>{fetchRides();},[]);
  const search=e=>{e.preventDefault();const p={};if(from)p.from=from;if(to)p.to=to;if(date)p.date=date;fetchRides(p);};

  // ── Leaflet bootstrap (same approach as PostRide) ─────────────────────────
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
    s.onload = () => { initMap(); };
    document.head.appendChild(s);
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  const dotIcon = (color) => window.L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};
            border:3px solid #050a0e;box-shadow:0 0 0 4px ${color}33"></div>`,
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

    map.setView([lat, lng], 12);

    map.on('click', async (e) => {
      const { lat: la, lng: lo } = e.latlng;
      moveMarker('from', la, lo);
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

  const moveMarker = (which, lat, lng) => {
    if (!leafletMap.current) return;
    const L = window.L;
    const ref = which === 'from' ? fromMarker : toMarker;
    if (!ref.current) {
      ref.current = L.marker([lat, lng], { icon: dotIcon(which === 'from' ? '#00e676' : '#26c6da') }).addTo(leafletMap.current);
    } else {
      ref.current.setLatLng([lat, lng]);
    }
    fitBounds();
    leafletMap.current.setView([lat, lng], 13);
  };

  const fitBounds = () => {
    if (!leafletMap.current) return;
    const pts = [];
    if (fromMarker.current) pts.push(fromMarker.current.getLatLng());
    if (toMarker.current) pts.push(toMarker.current.getLatLng());
    if (pts.length === 2) leafletMap.current.fitBounds(window.L.latLngBounds(pts), { padding: [40, 40] });
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        moveMarker('from', lat, lng);
        const name = await reverseGeocode(lat, lng);
        if (name) setFrom(name);
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { timeout: 8000 }
    );
  };

  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      .sp{min-height:100vh;background:#050a0e;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;padding:48px 24px 80px;}
      .sp-inner{max-width:1000px;margin:0 auto;}
      .sp-head{margin-bottom:32px;}.sp-head h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:6px;}.sp-head h1 span{color:#00e676;}.sp-head p{color:rgba(232,244,240,0.4);font-size:15px;font-weight:300;}
      .sbar{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:20px 24px;display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:14px;align-items:end;margin-bottom:18px;position:relative;overflow:visible;}
      @media(max-width:680px){.sbar{grid-template-columns:1fr;}}
      .sf{display:flex;flex-direction:column;gap:6px;position:relative;}.sf label{font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(232,244,240,0.35);}
      .sf-row{display:flex;align-items:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;transition:border-color 0.2s;}
      .sf-row:focus-within,.sf-row.open{border-color:rgba(0,230,118,0.4);}
      .sf-row input{flex:1;background:transparent;border:none;padding:11px 14px;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;}
      .sf-row input::placeholder{color:rgba(232,244,240,0.2);}
      .sf input[type=date]{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:11px 14px;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;}
      .sf input::-webkit-calendar-picker-indicator{filter:invert(0.6);cursor:pointer;}
      .sf-icon{padding-left:12px;color:rgba(232,244,240,0.3);font-size:14px;}
      .loc-btn-s{background:rgba(0,230,118,0.1);border:none;border-left:1px solid rgba(255,255,255,0.08);color:#00e676;padding:0 12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;white-space:nowrap;height:100%;min-height:44px;display:flex;align-items:center;gap:4px;border-radius:0 12px 12px 0;}
      .loc-btn-s:hover{background:rgba(0,230,118,0.18);}.loc-btn-s:disabled{opacity:0.5;cursor:not-allowed;}
      .suggest-drop{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#0f1c24;border:1px solid rgba(0,230,118,0.2);border-radius:14px;overflow:hidden;z-index:9999;box-shadow:0 12px 40px rgba(0,0,0,0.5);}
      .suggest-item{display:flex;align-items:flex-start;gap:10px;padding:11px 16px;cursor:pointer;transition:background 0.15s;border-bottom:1px solid rgba(255,255,255,0.04);}
      .suggest-item:last-child{border-bottom:none;}.suggest-item:hover{background:rgba(0,230,118,0.08);}
      .suggest-pin{font-size:13px;flex-shrink:0;margin-top:1px;}.suggest-text{font-size:13px;color:rgba(232,244,240,0.8);line-height:1.4;}
      .btn-s{background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:12px 24px;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.25s;height:46px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,230,118,0.3);}
      .btn-s:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,230,118,0.45);}
      .map-wrap{border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);height:230px;position:relative;background:#0d1b24;margin-bottom:36px;}
      #search-map{height:100%;width:100%;}
      .map-badge{position:absolute;top:12px;left:12px;z-index:1000;background:rgba(5,10,14,0.88);border:1px solid rgba(0,230,118,0.25);color:#00e676;font-size:11px;font-weight:600;letter-spacing:0.08em;padding:5px 12px;border-radius:100px;text-transform:uppercase;backdrop-filter:blur(6px);}
      .map-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#0d1b24;z-index:999;color:rgba(232,244,240,0.3);font-size:14px;transition:opacity 0.5s;pointer-events:none;}
      .map-loading.hidden{opacity:0;}
      .bounce{font-size:2.2rem;animation:bounce 1.4s ease-in-out infinite;}
      @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      .leaflet-container{background:#0d1b24 !important;}
      .leaflet-tile-pane{filter:brightness(0.85) saturate(0.7);}
      .rhdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}.rhdr h2{font-size:1rem;font-weight:700;}.rcnt{font-size:13px;color:rgba(232,244,240,0.35);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);padding:4px 12px;border-radius:100px;}
      .rcard{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:24px;margin-bottom:14px;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden;}
      .rcard::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,230,118,0.25),transparent);opacity:0;transition:opacity 0.3s;}
      .rcard:hover{transform:translateY(-3px);border-color:rgba(0,230,118,0.18);background:rgba(0,230,118,0.03);box-shadow:0 12px 40px rgba(0,0,0,0.3);}.rcard:hover::before{opacity:1;}
      .ctop{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;}
      .croute{flex:1;display:flex;align-items:flex-start;gap:12px;}.cloc{flex:1;}
      .cloc-lbl{font-size:10px;color:rgba(232,244,240,0.3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;font-weight:600;}
      .cloc-val{font-size:15px;font-weight:700;color:#e8f4f0;line-height:1.3;letter-spacing:-0.01em;}
      .carrow{color:#00e676;font-size:20px;flex-shrink:0;margin-top:18px;}
      .cright{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
      .sbig{font-size:2.2rem;font-weight:800;color:#00e676;line-height:1;letter-spacing:-0.04em;}.slbl{font-size:11px;color:rgba(232,244,240,0.3);text-align:right;}
      .cmeta{display:flex;gap:8px;flex-wrap:wrap;}
      .cchip{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);padding:5px 12px;border-radius:100px;font-size:12px;color:rgba(232,244,240,0.55);font-weight:500;}
      .cfooter{display:flex;align-items:center;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.05);flex-wrap:wrap;}
      .pby{font-size:12px;color:rgba(232,244,240,0.25);margin-left:auto;}
      .btn-req{background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:10px 24px;border-radius:100px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.25s;box-shadow:0 3px 14px rgba(0,230,118,0.35);}
      .btn-req:hover{transform:scale(1.04);box-shadow:0 6px 20px rgba(0,230,118,0.5);}
      .btn-shr{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:rgba(232,244,240,0.5);padding:10px 18px;border-radius:100px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;transition:all 0.2s;}
      .btn-shr:hover{border-color:rgba(38,198,218,0.3);color:#26c6da;}
      .lst{text-align:center;padding:80px 20px;}.spin{display:inline-block;width:36px;height:36px;border:3px solid rgba(0,230,118,0.15);border-top-color:#00e676;border-radius:50%;animation:spin 0.8s linear infinite;}
      @keyframes spin{to{transform:rotate(360deg)}}.lst p{margin-top:14px;font-size:14px;color:rgba(232,244,240,0.3);}
      .est{text-align:center;padding:80px 20px;}.est-icon{font-size:3rem;margin-bottom:14px;}.est h3{font-size:1.1rem;font-weight:700;color:rgba(232,244,240,0.6);margin-bottom:8px;}.est p{font-size:14px;color:rgba(232,244,240,0.3);}
      .mo{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fi 0.2s ease;}
      @keyframes fi{from{opacity:0}to{opacity:1}}
      .mb{background:#0d1b24;border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px;max-width:480px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08);animation:su 0.3s cubic-bezier(0.16,1,0.3,1);}
      @keyframes su{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      .mh{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;}.mh h3{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.15rem;font-weight:800;color:#e8f4f0;letter-spacing:-0.02em;}.mh p{font-size:13px;color:rgba(232,244,240,0.35);margin-top:3px;}
      .mc{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.5);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;}
      .mc:hover{background:rgba(239,83,80,0.1);color:#ff8a80;border-color:rgba(239,83,80,0.3);}
      .mroute{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;margin-bottom:18px;display:flex;align-items:center;gap:10px;}
      .mrl{flex:1;}.mrl-lbl{font-size:10px;color:rgba(232,244,240,0.3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;}.mrl-val{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;color:#e8f4f0;}
      .mmeta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}.mpill{background:rgba(0,230,118,0.07);border:1px solid rgba(0,230,118,0.15);color:rgba(232,244,240,0.65);padding:5px 12px;border-radius:100px;font-size:12px;font-weight:500;}
      .mlbl{font-size:11px;color:rgba(232,244,240,0.35);font-weight:600;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:8px;}
      .mta{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;resize:none;outline:none;transition:border-color 0.2s;min-height:80px;}
      .mta:focus{border-color:rgba(0,230,118,0.4);}.mta::placeholder{color:rgba(232,244,240,0.2);}
      .mbtns{display:flex;gap:10px;margin-top:14px;}
      .mbsend{flex:1;background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:13px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 18px rgba(0,230,118,0.35);}
      .mbsend:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,230,118,0.5);}.mbsend:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
      .mbcancel{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.5);padding:13px 20px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;cursor:pointer;transition:all 0.2s;}
      .mbcancel:hover{border-color:rgba(239,83,80,0.3);color:#ff8a80;}
      .creveal{background:rgba(0,230,118,0.06);border:1px solid rgba(0,230,118,0.15);border-radius:12px;padding:14px 18px;margin-top:14px;text-align:left;}
      .creveal p{font-size:12px;color:rgba(232,244,240,0.4);margin-bottom:3px;}.creveal strong{color:#00e676;font-size:15px;}
    `}</style>
    <div className="sp"><div className="sp-inner">
      <div className="sp-head"><h1>Find a <span>Ride</span></h1><p>Browse available rides and request a seat instantly.</p></div>

      <form className="sbar" onSubmit={search}>
        <LocationInput
          label="From"
          icon="📍"
          value={from}
          onChange={e=>setFrom(e.target.value)}
          onSelect={s=>{ setFrom(s.label); moveMarker('from', s.lat, s.lng); }}
          placeholder="Starting point"
          addonBtn={
            <button type="button" className="loc-btn-s" onClick={fetchCurrentLocation} disabled={locLoading}>
              {locLoading ? '⏳' : '🎯'} {locLoading ? '' : 'Locate'}
            </button>
          }
        />
        <LocationInput
          label="To"
          icon="🏁"
          value={to}
          onChange={e=>setTo(e.target.value)}
          onSelect={s=>{ setTo(s.label); moveMarker('to', s.lat, s.lng); }}
          placeholder="Destination"
        />
        <div className="sf"><label>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
        <button className="btn-s" type="submit">Search →</button>
      </form>

      <div className="map-wrap">
        <div className="map-badge">📍 From / 🏁 To — click map to set pickup</div>
        <div id="search-map" ref={mapRef} />
        <div className={`map-loading ${mapReady ? 'hidden' : ''}`}>
          <span className="bounce">📍</span>
          <span>Loading map…</span>
        </div>
      </div>

      {loading?<div className="lst"><div className="spin"/><p>Finding rides…</p></div>
      :searched&&rides.length===0?<div className="est"><div className="est-icon">🛣️</div><h3>No rides found</h3><p>Try different filters or check back soon.</p></div>
      :<><div className="rhdr"><h2>Available rides</h2><span className="rcnt">{rides.filter(r=>r.seats>0).length} found</span></div>
        {Array.isArray(rides) && rides.filter(ride=>ride.seats>0).map((ride) => (
          <div className="rcard" key={ride._id}>
            <div className="ctop">
              <div className="croute">
                <div className="cloc"><div className="cloc-lbl">From</div><div className="cloc-val">{trim(ride.from)}</div></div>
                <span className="carrow">→</span>
                <div className="cloc"><div className="cloc-lbl">To</div><div className="cloc-val">{trim(ride.to)}</div></div>
              </div>
              <div className="cright"><div className="sbig">{ride.seats}</div><div className="slbl">seats<br/>left</div></div>
            </div>
            <div className="cmeta">
              <span className="cchip">📅 {new Date(ride.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
              {ride.time&&<span className="cchip">🕐 {ride.time}</span>}
              <span className="cchip">💺 {ride.seats} seat{ride.seats!==1?'s':''} available</span>
            </div>
            <div className="cfooter">
              <button className="btn-req" onClick={()=>setSelected(ride)}>🚗 Request Seat</button>
              <button className="btn-shr">Share</button>
              {ride.postedBy?.name&&<span className="pby" style={{cursor:'pointer'}} onClick={()=>ride.postedBy?._id&&navigate('/profile/'+ride.postedBy._id)}>by {ride.postedBy.name}</span>}
            </div>
          </div>
        ))}
      </>}
    </div></div>
    {selected&&<RequestModal ride={selected} onClose={()=>setSelected(null)}/>}
  </>);
}