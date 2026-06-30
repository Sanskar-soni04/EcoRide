// src/pages/PublicProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function PublicProfile(){
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState('');

  useEffect(()=>{
    setLoading(true); setErr('');
    api.get('/profile/'+userId)
      .then(({data})=>setProfile(data))
      .catch(e=>setErr(e?.response?.data?.message||'Could not load this profile'))
      .finally(()=>setLoading(false));
  },[userId]);

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      .pp{min-height:100vh;background:#050a0e;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;padding:48px 24px 80px;}
      .pp-inner{max-width:600px;margin:0 auto;}
      .pp-back{background:none;border:none;color:rgba(232,244,240,0.4);font-size:13px;cursor:pointer;margin-bottom:24px;display:flex;align-items:center;gap:6px;}
      .pp-back:hover{color:#00e676;}
      .pp-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;text-align:center;}
      .pp-avatar{width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,#00e676,#26c6da);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:32px;color:#050a0e;margin:0 auto 16px;}
      .pp-name{font-size:1.5rem;font-weight:800;letter-spacing:-0.02em;}
      .pp-pills{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px;}
      .pp-pill{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);padding:5px 14px;border-radius:100px;font-size:12px;color:rgba(232,244,240,0.6);font-weight:500;}
      .pp-pill.gold{background:rgba(255,215,0,0.08);border-color:rgba(255,215,0,0.2);color:#ffd700;}
      .pp-stats{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:28px;}
      .pp-stat{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px;}
      .pp-stat-val{font-size:1.7rem;font-weight:800;color:#00e676;}
      .pp-stat-lbl{font-size:12px;color:rgba(232,244,240,0.4);margin-top:4px;}
      .pp-vehicle{margin-top:24px;background:rgba(0,230,118,0.04);border:1px solid rgba(0,230,118,0.12);border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;text-align:left;}
      .vb-icon{font-size:1.6rem;}
      .vb-title{font-size:13px;font-weight:600;}
      .vb-sub{font-size:12px;color:rgba(232,244,240,0.4);}
      .loading-d,.err-box{text-align:center;padding:80px 20px;}
      .spin{display:inline-block;width:32px;height:32px;border:3px solid rgba(0,230,118,0.15);border-top-color:#00e676;border-radius:50%;animation:spin 0.8s linear infinite;}
      @keyframes spin{to{transform:rotate(360deg)}}
      .err-box p{color:rgba(232,244,240,0.4);font-size:14px;}
    `}</style>
    <div className="pp"><div className="pp-inner">
      <button className="pp-back" onClick={()=>navigate(-1)}>← Back</button>
      {loading
        ? <div className="loading-d"><div className="spin"/></div>
        : err
          ? <div className="err-box"><p>{err}</p></div>
          : <div className="pp-card">
              <div className="pp-avatar">{profile.name?.[0]?.toUpperCase()||'?'}</div>
              <div className="pp-name">{profile.name}</div>
              <div className="pp-pills">
                <span className="pp-pill">{profile.role==='driver'?'🚗 Driver':'🎒 Passenger'}</span>
                {profile.avgRating!=null && <span className="pp-pill gold">⭐ {profile.avgRating} ({profile.totalReviews} reviews)</span>}
                {profile.createdAt && <span className="pp-pill">📅 Joined {new Date(profile.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>}
              </div>
              <div className="pp-stats">
                <div className="pp-stat"><div className="pp-stat-val">{profile.ridesAsDriver}</div><div className="pp-stat-lbl">Rides driven</div></div>
                <div className="pp-stat"><div className="pp-stat-val" style={{color:'#26c6da'}}>{profile.totalReviews}</div><div className="pp-stat-lbl">Reviews received</div></div>
              </div>
              {profile.vehicle?.number && (
                <div className="pp-vehicle">
                  <div className="vb-icon">🚙</div>
                  <div>
                    <div className="vb-title">{profile.vehicle.color} {profile.vehicle.model} · {profile.vehicle.number}</div>
                    <div className="vb-sub">Type: {profile.vehicle.type}</div>
                  </div>
                </div>
              )}
            </div>
      }
    </div></div>
  </>);
}