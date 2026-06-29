// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

function trim(str, n = 3) { return str ? str.split(',').map(s => s.trim()).slice(0, n).join(', ') : '—'; }
const STATUS_COLOR = { pending:'#ffa726', accepted:'#00e676', rejected:'#ef5350', completed:'#26c6da' };
const STATUS_BG    = { pending:'rgba(255,167,38,0.1)', accepted:'rgba(0,230,118,0.1)', rejected:'rgba(239,83,80,0.1)', completed:'rgba(38,198,218,0.1)' };

function RequestPopup({ request, onAccept, onReject, onClose }) {
  return (
    <div className="rp-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="rp-box">
        <div className="rp-icon">🔔</div>
        <h3 className="rp-title">New Ride Request</h3>
        <p className="rp-sub">Someone wants to join your ride</p>
        <div className="rp-who">
          <div className="rp-avatar">{request.passenger?.name?.[0]?.toUpperCase()||'?'}</div>
          <div>
            <div className="rp-name">{request.passenger?.name||'Unknown'}</div>
            <div className="rp-contact">{request.passenger?.email}</div>
            {request.passenger?.phone&&<div className="rp-contact">📞 {request.passenger.phone}</div>}
          </div>
        </div>
        <div className="rp-route">
          <div className="rp-loc"><div className="rp-lbl">From</div><div className="rp-val">{trim(request.ride?.from)}</div></div>
          <span style={{color:'#00e676',fontSize:18}}>→</span>
          <div className="rp-loc" style={{textAlign:'right'}}><div className="rp-lbl">To</div><div className="rp-val">{trim(request.ride?.to)}</div></div>
        </div>
        {request.message&&<div className="rp-msg">"{request.message}"</div>}
        <div className="rp-btns">
          <button className="rp-accept" onClick={()=>onAccept(request._id)}>✓ Accept</button>
          <button className="rp-reject" onClick={()=>onReject(request._id)}>✕ Reject</button>
        </div>
      </div>
    </div>
  );
}

function AcceptedAlert({ request, onClose }) {
  return (
    <div className="rp-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="rp-box">
        <div style={{fontSize:'3rem',textAlign:'center',marginBottom:12}}>🎉</div>
        <h3 className="rp-title" style={{color:'#00e676'}}>Ride Confirmed!</h3>
        <p className="rp-sub">Your seat has been accepted by the driver</p>
        <div className="rp-route" style={{margin:'18px 0'}}>
          <div className="rp-loc"><div className="rp-lbl">From</div><div className="rp-val">{trim(request.ride?.from)}</div></div>
          <span style={{color:'#00e676',fontSize:18}}>→</span>
          <div className="rp-loc" style={{textAlign:'right'}}><div className="rp-lbl">To</div><div className="rp-val">{trim(request.ride?.to)}</div></div>
        </div>
        <div className="rp-who">
          <div className="rp-avatar" style={{background:'linear-gradient(135deg,#26c6da,#00e676)'}}>🚗</div>
          <div>
            <div className="rp-name">Driver: {request.ride?.postedBy?.name||'Your driver'}</div>
            {request.ride?.postedBy?.phone&&<div className="rp-contact">📞 {request.ride.postedBy.phone}</div>}
            {request.ride?.postedBy?.email&&<div className="rp-contact">✉ {request.ride.postedBy.email}</div>}
            {request.ride?.postedBy?.vehicle&&<div className="rp-contact">🚙 {request.ride.postedBy.vehicle.color} {request.ride.postedBy.vehicle.model} · {request.ride.postedBy.vehicle.number}</div>}
          </div>
        </div>
        <button className="rp-accept" style={{width:'100%',marginTop:16}} onClick={onClose}>Got it! 🚗</button>
      </div>
    </div>
  );
}

function ReviewModal({ ride, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    await onSubmit(ride._id, rating, comment);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="rp-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="rp-box" style={{maxWidth:420}}>
        <h3 className="rp-title" style={{marginBottom:16}}>Rate your ride</h3>
        <p className="rp-sub">How was your trip from {trim(ride.from, 2)} to {trim(ride.to, 2)}?</p>

        <div style={{textAlign:'center',margin:'20px 0'}}>
          <div style={{display:'flex',justifyContent:'center',gap:8,cursor:'pointer'}}>
            {[1,2,3,4,5].map(n => (
              <span
                key={n}
                style={{fontSize:'2rem',transition:'transform 0.15s',transform: n <= (hovered||rating) ? 'scale(1.2)' : 'scale(1)'}}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
              >{n <= (hovered||rating) ? '⭐' : '☆'}</span>
            ))}
          </div>
          <div style={{fontSize:13,color:'rgba(232,244,240,0.4)',marginTop:8}}>
            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Great' : rating === 5 ? 'Excellent' : 'Tap a star'}
          </div>
        </div>

        <div className="mlbl" style={{fontSize:11,color:'rgba(232,244,240,0.35)',fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:8}}>Comment (optional)</div>
        <textarea className="mta" style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'12px 16px',color:'#e8f4f0',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:14,resize:'none',outline:'none',minHeight:70,marginBottom:16}}
          placeholder="Share your experience…"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <button className="rp-accept" style={{width:'100%'}} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Review ⭐'}
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user,          setUser]          = useState(null);
  const [role,          setRole]          = useState('driver');
  const [myRides,       setMyRides]       = useState([]);
  const [myRequests,    setMyRequests]    = useState([]);
  const [incomingReqs,  setIncomingReqs]  = useState([]);
  const [history,       setHistory]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [popup,         setPopup]         = useState(null);
  const [acceptedAlert, setAcceptedAlert] = useState(null);
  const [activeTab,     setActiveTab]     = useState('active');
  const [reviewRide,    setReviewRide]    = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && stored !== 'undefined' && stored !== 'null') {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        if (u?.role) setRole(u.role);
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/rides/history');
      setHistory(data);
    } catch { setHistory([]); }
  }, []);

  const loadDriver = useCallback(async () => {
    try {
      const [ridesRes, reqsRes] = await Promise.all([api.get('/rides/my'), api.get('/rides/requests-for-me')]);
      setMyRides(ridesRes.data);
      setIncomingReqs(reqsRes.data);
      if (reqsRes.data.length > 0 && !popup) setPopup(reqsRes.data[0]);
    } catch { setMyRides([]); setIncomingReqs([]); }
  }, []);

  const loadPassenger = useCallback(async () => {
    try {
      const res = await api.get('/rides/my-requests');
      setMyRequests(res.data);
      const justAccepted = res.data.find(r => r.status==='accepted' && !sessionStorage.getItem(`alerted_${r._id}`));
      if (justAccepted) { setAcceptedAlert(justAccepted); sessionStorage.setItem(`alerted_${justAccepted._id}`,'1'); }
    } catch { setMyRequests([]); }
  }, []);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      if (role==='driver') await loadDriver();
      else await loadPassenger();
      await loadHistory();
      setLoading(false);
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [role, loadDriver, loadPassenger, loadHistory]);

  const handleAccept = async (reqId) => {
    try { await api.put(`/rides/request/${reqId}/accept`); setPopup(null); await loadDriver(); }
    catch(e) { alert(e?.response?.data?.message||'Error'); }
  };

  const handleReject = async (reqId) => {
    try {
      await api.put(`/rides/request/${reqId}/reject`);
      const remaining = incomingReqs.filter(r=>r._id!==reqId);
      setPopup(remaining.length>0 ? remaining[0] : null);
      await loadDriver();
    } catch(e) { alert(e?.response?.data?.message||'Error'); }
  };

  const handleCancelRequest = async (reqId) => {
    try {
      await api.delete(`/rides/request/${reqId}/cancel`);
      toast.success('Request cancelled');
      await loadPassenger();
    } catch(e) { toast.error(e?.response?.data?.message||'Failed to cancel'); }
  };

  const handleCompleteRide = async (rideId) => {
    try {
      await api.put(`/rides/${rideId}/complete`);
      toast.success('Ride marked as completed!');
      await loadDriver();
      await loadHistory();
    } catch(e) { toast.error(e?.response?.data?.message||'Failed to complete ride'); }
  };

  const handleReview = async (rideId, rating, comment) => {
    try {
      await api.post(`/rides/${rideId}/review`, { rating, comment });
      toast.success('Review submitted! 🌟');
      await loadHistory();
    } catch(e) { toast.error(e?.response?.data?.message||'Failed to submit review'); }
  };

  const activeRides = myRides.filter(r => r.status === 'active');

  const totalSeats = activeRides.reduce((a,r)=>a+(r.seats||0),0);
  const co2Saved   = (activeRides.length*2.4).toFixed(1);
  const moneySaved = activeRides.length*180;

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      .dash{min-height:100vh;background:#050a0e;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;padding:48px 24px 80px;}
      .dash-inner{max-width:1100px;margin:0 auto;}
      .dash-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:36px;}
      .dash-greeting h1{font-size:clamp(1.6rem,4vw,2.2rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:4px;}
      .dash-greeting h1 span{color:#00e676;}
      .dash-greeting p{font-size:14px;color:rgba(232,244,240,0.4);font-weight:300;}
      .role-toggle{display:flex;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:50px;padding:4px;}
      .rt-btn{padding:8px 22px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:rgba(232,244,240,0.45);transition:all 0.25s;}
      .rt-btn.active{background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;box-shadow:0 2px 12px rgba(0,230,118,0.35);}
      .notif-bell{position:relative;display:flex;align-items:center;gap:8px;}
      .bell-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.6);width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;transition:all 0.2s;position:relative;}
      .bell-btn:hover{background:rgba(0,230,118,0.1);border-color:rgba(0,230,118,0.3);}
      .bell-badge{position:absolute;top:-4px;right:-4px;background:#ef5350;color:#fff;width:18px;height:18px;border-radius:50%;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #050a0e;animation:badgePop 0.3s cubic-bezier(0.16,1,0.3,1);}
      @keyframes badgePop{from{transform:scale(0)}to{transform:scale(1)}}
      .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:36px;}
      .stat-block{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:22px 18px;text-align:center;transition:all 0.3s;}
      .stat-block:hover{transform:translateY(-3px);border-color:rgba(0,230,118,0.18);}
      .stat-val{font-family:'Plus Jakarta Sans',sans-serif;font-size:2rem;font-weight:800;color:#00e676;letter-spacing:-0.04em;}
      .stat-val.teal{color:#26c6da;}
      .stat-lbl{font-size:12px;color:rgba(232,244,240,0.4);margin-top:4px;font-weight:300;}
      .sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
      .sec-hdr h2{font-size:1.1rem;font-weight:700;}
      .sec-badge{background:rgba(239,83,80,0.15);border:1px solid rgba(239,83,80,0.25);color:#ff8a80;padding:3px 10px;border-radius:100px;font-size:12px;font-weight:600;}
      .sec-badge.green{background:rgba(0,230,118,0.1);border-color:rgba(0,230,118,0.2);color:#00e676;}
      .ride-list{display:flex;flex-direction:column;gap:12px;}
      .ride-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;transition:all 0.25s;}
      .ride-item:hover{border-color:rgba(0,230,118,0.18);background:rgba(0,230,118,0.02);}
      .ride-route{font-size:14px;font-weight:600;margin-bottom:5px;letter-spacing:-0.01em;}
      .ride-route .arrow{color:#00e676;margin:0 8px;}
      .ride-meta{display:flex;gap:12px;font-size:12px;color:rgba(232,244,240,0.4);flex-wrap:wrap;}
      .ri-badge{padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;}
      .pending-count{background:rgba(255,167,38,0.12);border:1px solid rgba(255,167,38,0.25);color:#ffa726;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;}
      .pending-count:hover{background:rgba(255,167,38,0.22);}
      .req-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;transition:all 0.25s;margin-bottom:10px;}
      .req-card:hover{border-color:rgba(0,230,118,0.15);}
      .req-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#00e676,#26c6da);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#050a0e;flex-shrink:0;}
      .req-info{flex:1;}
      .req-name{font-size:14px;font-weight:700;margin-bottom:2px;}
      .req-detail{font-size:12px;color:rgba(232,244,240,0.4);}
      .req-actions{display:flex;gap:8px;}
      .btn-acc{background:rgba(0,230,118,0.12);border:1px solid rgba(0,230,118,0.3);color:#00e676;padding:7px 18px;border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;}
      .btn-acc:hover{background:rgba(0,230,118,0.2);}
      .btn-rej{background:rgba(239,83,80,0.08);border:1px solid rgba(239,83,80,0.25);color:#ff8a80;padding:7px 18px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;}
      .btn-rej:hover{background:rgba(239,83,80,0.15);}
      .vehicle-box{background:rgba(0,230,118,0.04);border:1px solid rgba(0,230,118,0.12);border-radius:14px;padding:14px 18px;margin-bottom:24px;display:flex;align-items:center;gap:12px;}
      .vb-icon{font-size:1.6rem;}
      .vb-title{font-size:13px;font-weight:600;color:#e8f4f0;margin-bottom:2px;}
      .vb-sub{font-size:12px;color:rgba(232,244,240,0.4);}
      .preq-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px 22px;margin-bottom:12px;transition:all 0.25s;}
      .preq-card:hover{transform:translateY(-2px);border-color:rgba(0,230,118,0.15);}
      .preq-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;}
      .preq-route{font-size:14px;font-weight:700;letter-spacing:-0.01em;}
      .preq-route .arrow{color:#00e676;margin:0 6px;}
      .status-chip{padding:4px 14px;border-radius:100px;font-size:11px;font-weight:700;flex-shrink:0;}
      .empty{text-align:center;padding:60px 20px;}
      .empty-icon{font-size:2.5rem;margin-bottom:12px;}
      .empty p{font-size:14px;color:rgba(232,244,240,0.3);margin-bottom:18px;}
      .btn-go{background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:11px 28px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.25s;}
      .btn-go:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,230,118,0.4);}
      .loading-d{text-align:center;padding:80px;color:rgba(232,244,240,0.3);}
      .spin{display:inline-block;width:32px;height:32px;border:3px solid rgba(0,230,118,0.15);border-top-color:#00e676;border-radius:50%;animation:spin 0.8s linear infinite;}
      @keyframes spin{to{transform:rotate(360deg)}}
      .rp-overlay{position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fi 0.2s ease;}
      @keyframes fi{from{opacity:0}to{opacity:1}}
      .rp-box{background:#0d1b24;border:1px solid rgba(255,255,255,0.1);border-radius:26px;padding:32px;max-width:440px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.08);animation:su 0.35s cubic-bezier(0.16,1,0.3,1);}
      @keyframes su{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      .rp-icon{font-size:2.4rem;text-align:center;margin-bottom:10px;}
      .rp-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.2rem;font-weight:800;color:#e8f4f0;text-align:center;margin-bottom:4px;}
      .rp-sub{font-size:13px;color:rgba(232,244,240,0.4);text-align:center;margin-bottom:20px;}
      .rp-who{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px;margin-bottom:14px;}
      .rp-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#00e676,#26c6da);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#050a0e;flex-shrink:0;}
      .rp-name{font-size:14px;font-weight:700;color:#e8f4f0;}
      .rp-contact{font-size:12px;color:rgba(232,244,240,0.4);margin-top:2px;}
      .rp-route{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:13px;padding:13px 16px;display:flex;align-items:center;gap:10px;margin-bottom:14px;}
      .rp-loc{flex:1;}
      .rp-lbl{font-size:10px;color:rgba(232,244,240,0.3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;}
      .rp-val{font-size:13px;font-weight:700;color:#e8f4f0;}
      .rp-msg{background:rgba(255,255,255,0.03);border-left:3px solid rgba(0,230,118,0.4);border-radius:0 10px 10px 0;padding:10px 14px;font-size:13px;color:rgba(232,244,240,0.6);font-style:italic;margin-bottom:16px;line-height:1.5;}
      .rp-btns{display:flex;gap:10px;}
      .rp-accept{flex:1;background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:13px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.25s;}
      .rp-accept:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,230,118,0.4);}
      .rp-reject{flex:1;background:rgba(239,83,80,0.1);border:1px solid rgba(239,83,80,0.25);color:#ff8a80;padding:13px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:all 0.2s;}
      .rp-reject:hover{background:rgba(239,83,80,0.18);}
      .rp-who-driver{display:flex;align-items:center;gap:12px;background:rgba(0,230,118,0.04);border:1px solid rgba(0,230,118,0.12);border-radius:14px;padding:14px;margin-top:10px;}
    `}</style>

    <div className="dash"><div className="dash-inner">
      <div className="dash-top">
        <div className="dash-greeting">
          <h1>Hey, <span>{user?.name?.split(' ')[0]||'Rider'}</span> 👋</h1>
          <p>Here's your EcoRide activity at a glance.</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {role==='driver'&&(
            <div className="notif-bell">
              <div className="bell-btn" onClick={()=>incomingReqs.length>0&&setPopup(incomingReqs[0])}>
                🔔{incomingReqs.length>0&&<span className="bell-badge">{incomingReqs.length}</span>}
              </div>
            </div>
          )}
          <div className="role-toggle">
            <button className={`rt-btn ${role==='driver'?'active':''}`}    onClick={()=>setRole('driver')}>🚗 Driver</button>
            <button className={`rt-btn ${role==='passenger'?'active':''}`} onClick={()=>setRole('passenger')}>🎒 Passenger</button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display:'flex',gap:8,marginBottom:28}}>
        <button className={`rt-btn ${activeTab==='active'?'active':''}`} style={{padding:'8px 24px',borderRadius:50,border:'none',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',background:activeTab==='active'?'linear-gradient(135deg,#00e676,#26c6da)':'rgba(255,255,255,0.04)',color:activeTab==='active'?'#050a0e':'rgba(232,244,240,0.45)'}} onClick={()=>setActiveTab('active')}>Active</button>
        <button className={`rt-btn ${activeTab==='history'?'active':''}`} style={{padding:'8px 24px',borderRadius:50,border:'none',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',background:activeTab==='history'?'linear-gradient(135deg,#00e676,#26c6da)':'rgba(255,255,255,0.04)',color:activeTab==='history'?'#050a0e':'rgba(232,244,240,0.45)'}} onClick={()=>setActiveTab('history')}>📜 History</button>
      </div>

      {/* ---- ACTIVE TAB ---- */}
      {activeTab==='active'&&<>
        {role==='driver'&&<>
          {user?.vehicle&&(
            <div className="vehicle-box">
              <div className="vb-icon">🚙</div>
              <div>
                <div className="vb-title">{user.vehicle.color} {user.vehicle.model} · {user.vehicle.number}</div>
                <div className="vb-sub">Type: {user.vehicle.type} · Your registered vehicle</div>
              </div>
            </div>
          )}
          <div className="stats-row">
            <div className="stat-block"><div className="stat-val">{myRides.length}</div><div className="stat-lbl">Rides Posted</div></div>
            <div className="stat-block"><div className="stat-val">{totalSeats}</div><div className="stat-lbl">Seats Offered</div></div>
            <div className="stat-block"><div className="stat-val teal">₹{moneySaved.toLocaleString()}</div><div className="stat-lbl">Est. Fuel Saved</div></div>
            <div className="stat-block"><div className="stat-val teal">{co2Saved} kg</div><div className="stat-lbl">CO₂ Offset</div></div>
          </div>
          {incomingReqs.length>0&&<>
            <div className="sec-hdr"><h2>Pending requests</h2><span className="sec-badge">{incomingReqs.length} waiting</span></div>
            {incomingReqs.map(req=>(
              <div className="req-card" key={req._id}>
                <div className="req-avatar">{req.passenger?.name?.[0]?.toUpperCase()||'?'}</div>
                <div className="req-info">
                  <div className="req-name">{req.passenger?.name}</div>
                  <div className="req-detail">{trim(req.ride?.from,2)} → {trim(req.ride?.to,2)}</div>
                  {req.message&&<div className="req-detail" style={{fontStyle:'italic'}}>"{req.message}"</div>}
                </div>
                <div className="req-actions">
                  <button className="btn-acc" onClick={()=>handleAccept(req._id)}>✓ Accept</button>
                  <button className="btn-rej" onClick={()=>handleReject(req._id)}>✕ Reject</button>
                </div>
              </div>
            ))}
          </>}
          <div className="sec-hdr" style={{marginTop:incomingReqs.length>0?24:0}}><h2>Your rides</h2><span className="sec-badge green">{myRides.length} posted</span></div>
          {loading?<div className="loading-d"><div className="spin"/></div>
          :myRides.length===0?<div className="empty"><div className="empty-icon">🛣️</div><p>No rides posted yet.</p><button className="btn-go" onClick={()=>navigate('/post-ride')}>+ Post your first ride</button></div>
          :<div className="ride-list">{myRides.map(ride=>(
            <div className="ride-item" key={ride._id}>
              <div>
                <div className="ride-route">{trim(ride.from,2)}<span className="arrow">→</span>{trim(ride.to,2)}</div>
                <div className="ride-meta">
                  <span>📅 {new Date(ride.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                  <span>🕐 {ride.time}</span>
                  <span>💺 {ride.seats} seat{ride.seats!==1?'s':''}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                {ride.pendingRequests>0&&<span className="pending-count" onClick={()=>setPopup(incomingReqs.find(r=>r.ride?._id===ride._id)||incomingReqs[0])}>🔔 {ride.pendingRequests} request{ride.pendingRequests>1?'s':''}</span>}
                {ride.status==='active'?<>
                  <button className="ri-badge" style={{background:'rgba(38,198,218,0.1)',color:'#26c6da',border:'1px solid rgba(38,198,218,0.2)',cursor:'pointer',padding:'4px 12px',borderRadius:100,fontSize:11,fontWeight:700,fontFamily:'Plus Jakarta Sans,sans-serif'}} onClick={()=>navigate(`/post-ride/${ride._id}`)}>✎ Edit</button>
                  <button className="ri-badge" style={{background:'rgba(0,230,118,0.1)',color:'#00e676',border:'1px solid rgba(0,230,118,0.2)',cursor:'pointer',padding:'4px 12px',borderRadius:100,fontSize:11,fontWeight:700,fontFamily:'Plus Jakarta Sans,sans-serif'}} onClick={()=>handleCompleteRide(ride._id)}>✓ Complete</button>
                </>:<span className="ri-badge" style={{background:'rgba(38,198,218,0.1)',color:'#26c6da',border:'1px solid rgba(38,198,218,0.2)'}}>{ride.status==='completed'?'✓ Completed':'✕ Cancelled'}</span>}
              </div>
            </div>
          ))}</div>}
        </>}

        {role==='passenger'&&<>
          <div className="stats-row">
            <div className="stat-block"><div className="stat-val">{myRequests.length}</div><div className="stat-lbl">Rides Requested</div></div>
            <div className="stat-block"><div className="stat-val">{myRequests.filter(r=>r.status==='accepted').length}</div><div className="stat-lbl">Confirmed</div></div>
            <div className="stat-block"><div className="stat-val teal">{myRequests.filter(r=>r.status==='pending').length}</div><div className="stat-lbl">Pending</div></div>
            <div className="stat-block"><div className="stat-val teal">{(myRequests.filter(r=>r.status==='accepted').length*2.4).toFixed(1)} kg</div><div className="stat-lbl">CO₂ Saved</div></div>
          </div>
          <div className="sec-hdr"><h2>My ride requests</h2><span className="sec-badge green">{myRequests.length} total</span></div>
          {loading?<div className="loading-d"><div className="spin"/></div>
          :myRequests.length===0?<div className="empty"><div className="empty-icon">🔍</div><p>No ride requests yet.</p><button className="btn-go" onClick={()=>navigate('/search')}>Browse rides</button></div>
          :myRequests.map(req=>(
            <div className="preq-card" key={req._id}>
              <div className="preq-top">
                <div>
                  <div className="preq-route">{trim(req.ride?.from,2)}<span className="arrow">→</span>{trim(req.ride?.to,2)}</div>
                  <div className="ride-meta" style={{marginTop:5}}>
                    {req.ride?.date&&<span>📅 {new Date(req.ride.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                    {req.ride?.time&&<span>🕐 {req.ride.time}</span>}
                  </div>
                </div>
                <span className="status-chip" style={{background:STATUS_BG[req.status],color:STATUS_COLOR[req.status],border:`1px solid ${STATUS_COLOR[req.status]}44`}}>
                  {req.status==='pending'?'⏳ Pending':req.status==='accepted'?'✓ Confirmed':req.status==='completed'?'✓ Completed':'✕ Rejected'}
                </span>
              </div>
              {req.status==='pending'&&(
                <button className="btn-rej" onClick={()=>handleCancelRequest(req._id)} style={{marginTop:8,fontSize:12}}>✕ Cancel Request</button>
              )}
              {req.status==='accepted'&&req.ride?.postedBy&&(
                <div className="rp-who-driver">
                  <div className="rp-avatar" style={{background:'linear-gradient(135deg,#26c6da,#00bfa5)',fontSize:20}}>🚗</div>
                  <div>
                    <div className="rp-name">Driver: {req.ride.postedBy.name}</div>
                    {req.ride.postedBy.phone&&<div className="rp-contact">📞 {req.ride.postedBy.phone}</div>}
                    {req.ride.postedBy.vehicle&&<div className="rp-contact">🚙 {req.ride.postedBy.vehicle.color} {req.ride.postedBy.vehicle.model} · {req.ride.postedBy.vehicle.number}</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </>}
      </>}

      {/* ---- HISTORY TAB ---- */}
      {activeTab==='history'&&<>
        <div className="sec-hdr"><h2>Ride History</h2><span className="sec-badge green">{history.length} completed</span></div>
        {loading?<div className="loading-d"><div className="spin"/></div>
        :history.length===0?<div className="empty"><div className="empty-icon">📜</div><p>No completed rides yet. Complete a ride to see it here.</p></div>
        :<div className="ride-list">{history.map(item=>(
          <div className="ride-item" key={item._id}>
            <div>
              <div className="ride-route">{trim(item.from,2)}<span className="arrow">→</span>{trim(item.to,2)}</div>
              <div className="ride-meta">
                <span>📅 {new Date(item.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                <span>🕐 {item.time}</span>
                {item.role==='passenger'&&<span>🎒 As passenger</span>}
                {item.role==='driver'&&<span>🚗 As driver</span>}
              </div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {item.reviewed
                ? <span className="ri-badge" style={{background:'rgba(255,215,0,0.1)',color:'#ffd700',border:'1px solid rgba(255,215,0,0.2)'}}>⭐ Rated {item.myRating}/5</span>
                : <button className="ri-badge" style={{background:'rgba(0,230,118,0.1)',color:'#00e676',border:'1px solid rgba(0,230,118,0.2)',cursor:'pointer',padding:'4px 12px',borderRadius:100,fontSize:11,fontWeight:700,fontFamily:'Plus Jakarta Sans,sans-serif'}} onClick={()=>setReviewRide(item)}>⭐ Rate this ride</button>
              }
            </div>
          </div>
        ))}</div>}
      </>}
    </div></div>

    {popup&&<RequestPopup request={popup} onAccept={handleAccept} onReject={handleReject} onClose={()=>setPopup(null)}/>}
    {acceptedAlert&&<AcceptedAlert request={acceptedAlert} onClose={()=>setAcceptedAlert(null)}/>}
    {reviewRide&&<ReviewModal ride={reviewRide} onClose={()=>setReviewRide(null)} onSubmit={handleReview}/>}
  </>);
}