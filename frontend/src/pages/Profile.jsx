// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

function trim(str, n=3){ return str?(str.split(',').map(s=>s.trim()).slice(0,n).join(', ')):'' }

export default function Profile(){
  const [profile,setProfile]=useState(null);
  const [reviews,setReviews]=useState([]);
  const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState(false);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({ name:'', phone:'', vehicleType:'', vehicleColor:'', vehicleModel:'', vehicleNumber:'', password:'' });

  const load=async()=>{
    setLoading(true);
    try{
      const [{data:p},{data:r}]=await Promise.all([api.get('/profile'),api.get('/profile/reviews')]);
      setProfile(p);
      setReviews(r.reviews||[]);
      setForm({
        name: p.name||'',
        phone: p.phone||'',
        vehicleType: p.vehicle?.type||'',
        vehicleColor: p.vehicle?.color||'',
        vehicleModel: p.vehicle?.model||'',
        vehicleNumber: p.vehicle?.number||'',
        password:'',
      });
    }catch{ toast.error('Failed to load profile'); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const save=async()=>{
    setSaving(true);
    try{
      const body={ name:form.name, phone:form.phone };
      if (form.vehicleType||form.vehicleColor||form.vehicleModel||form.vehicleNumber){
        body.vehicle={ type:form.vehicleType, color:form.vehicleColor, model:form.vehicleModel, number:form.vehicleNumber };
      }
      if (form.password && form.password.length>=6) body.password=form.password;
      const { data } = await api.put('/profile', body);
      toast.success('Profile updated');
      localStorage.setItem('user', JSON.stringify(data.user));
      setEditing(false);
      await load();
    }catch(e){ toast.error(e?.response?.data?.message||'Failed to update'); }
    setSaving(false);
  };

  if (loading) return (
    <div className="pf"><style>{baseCSS}</style>
      <div className="pf-inner"><div className="loading-d"><div className="spin"/></div></div>
    </div>
  );
  if (!profile) return null;

  return (<>
    <style>{baseCSS}</style>
    <div className="pf"><div className="pf-inner">

      <div className="pf-head">
        <div className="pf-avatar">{profile.name?.[0]?.toUpperCase()||'?'}</div>
        <div className="pf-headinfo">
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
          <div className="pf-pills">
            <span className="pf-pill">{profile.role==='driver'?'🚗 Driver':'🎒 Passenger'}</span>
            {profile.avgRating!=null && <span className="pf-pill gold">⭐ {profile.avgRating} ({profile.totalReviews})</span>}
            {profile.createdAt && <span className="pf-pill">📅 Joined {new Date(profile.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>}
          </div>
        </div>
        <button className="btn-edit" onClick={()=>setEditing(e=>!e)}>{editing?'Cancel':'✎ Edit profile'}</button>
      </div>

      <div className="stats-row">
        <div className="stat-block"><div className="stat-val">{profile.ridesAsDriver}</div><div className="stat-lbl">Rides driven</div></div>
        <div className="stat-block"><div className="stat-val teal">{profile.ridesAsPassenger}</div><div className="stat-lbl">Rides as passenger</div></div>
        <div className="stat-block"><div className="stat-val">{profile.avgRating??'—'}</div><div className="stat-lbl">Average rating</div></div>
        <div className="stat-block"><div className="stat-val teal">{profile.totalReviews}</div><div className="stat-lbl">Total reviews</div></div>
      </div>

      {editing && (
        <div className="edit-card">
          <h2>Edit details</h2>
          <div className="two-col">
            <div className="field-group">
              <label>Name</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            </div>
            <div className="field-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
            </div>
          </div>
          <div className="field-group" style={{marginTop:14}}>
            <label>New password (leave blank to keep current)</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••"/>
          </div>
          <h3 style={{marginTop:20,marginBottom:10,fontSize:13,color:'rgba(232,244,240,0.5)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Vehicle</h3>
          <div className="two-col">
            <div className="field-group"><label>Type</label><input value={form.vehicleType} onChange={e=>setForm({...form,vehicleType:e.target.value})} placeholder="Car / Bike"/></div>
            <div className="field-group"><label>Color</label><input value={form.vehicleColor} onChange={e=>setForm({...form,vehicleColor:e.target.value})}/></div>
            <div className="field-group"><label>Model</label><input value={form.vehicleModel} onChange={e=>setForm({...form,vehicleModel:e.target.value})}/></div>
            <div className="field-group"><label>Number</label><input value={form.vehicleNumber} onChange={e=>setForm({...form,vehicleNumber:e.target.value})}/></div>
          </div>
          <button className="btn-save" onClick={save} disabled={saving}>{saving?'Saving…':'Save changes'}</button>
        </div>
      )}

      {!editing && profile.vehicle?.number && (
        <div className="vehicle-box">
          <div className="vb-icon">🚙</div>
          <div>
            <div className="vb-title">{profile.vehicle.color} {profile.vehicle.model} · {profile.vehicle.number}</div>
            <div className="vb-sub">Type: {profile.vehicle.type}</div>
          </div>
        </div>
      )}

      <div className="sec-hdr"><h2>Reviews</h2><span className="sec-badge">{reviews.length} total</span></div>
      {reviews.length===0
        ? <div className="empty"><div className="empty-icon">⭐</div><p>No reviews yet.</p></div>
        : <div className="rev-list">{reviews.map(r=>(
            <div className="rev-card" key={r._id}>
              <div className="rev-top">
                <div className="rev-from">{r.from?.name||'Anonymous'}</div>
                <div className="rev-stars">{'⭐'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
              </div>
              {r.ride && <div className="rev-route">{trim(r.ride.from,2)} → {trim(r.ride.to,2)}</div>}
              {r.comment && <div className="rev-comment">"{r.comment}"</div>}
            </div>
          ))}</div>
      }
    </div></div>
  </>);
}

const baseCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  .pf{min-height:100vh;background:#050a0e;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;padding:48px 24px 80px;}
  .pf-inner{max-width:880px;margin:0 auto;}
  .pf-head{display:flex;align-items:center;gap:20px;margin-bottom:32px;flex-wrap:wrap;}
  .pf-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#00e676,#26c6da);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:28px;color:#050a0e;flex-shrink:0;}
  .pf-headinfo{flex:1;min-width:200px;}
  .pf-headinfo h1{font-size:1.6rem;font-weight:800;letter-spacing:-0.02em;}
  .pf-headinfo p{font-size:13px;color:rgba(232,244,240,0.4);margin-top:2px;}
  .pf-pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}
  .pf-pill{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);padding:5px 12px;border-radius:100px;font-size:12px;color:rgba(232,244,240,0.6);font-weight:500;}
  .pf-pill.gold{background:rgba(255,215,0,0.08);border-color:rgba(255,215,0,0.2);color:#ffd700;}
  .btn-edit{background:rgba(0,230,118,0.1);border:1px solid rgba(0,230,118,0.25);color:#00e676;padding:10px 22px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.2s;}
  .btn-edit:hover{background:rgba(0,230,118,0.18);}
  .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:28px;}
  .stat-block{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:22px 18px;text-align:center;}
  .stat-val{font-size:2rem;font-weight:800;color:#00e676;letter-spacing:-0.04em;}
  .stat-val.teal{color:#26c6da;}
  .stat-lbl{font-size:12px;color:rgba(232,244,240,0.4);margin-top:4px;font-weight:300;}
  .edit-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:26px;margin-bottom:28px;}
  .edit-card h2{font-size:1rem;font-weight:700;margin-bottom:18px;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  @media(max-width:600px){.two-col{grid-template-columns:1fr;}}
  .field-group{display:flex;flex-direction:column;gap:6px;}
  .field-group label{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,244,240,0.35);}
  .field-group input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:11px 14px;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;}
  .field-group input:focus{border-color:rgba(0,230,118,0.4);}
  .btn-save{margin-top:20px;background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:13px 28px;border-radius:50px;font-weight:700;font-size:14px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;}
  .btn-save:disabled{opacity:0.5;cursor:not-allowed;}
  .vehicle-box{background:rgba(0,230,118,0.04);border:1px solid rgba(0,230,118,0.12);border-radius:14px;padding:14px 18px;margin-bottom:28px;display:flex;align-items:center;gap:12px;}
  .vb-icon{font-size:1.6rem;}
  .vb-title{font-size:13px;font-weight:600;}
  .vb-sub{font-size:12px;color:rgba(232,244,240,0.4);}
  .sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .sec-hdr h2{font-size:1rem;font-weight:700;}
  .sec-badge{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:rgba(232,244,240,0.4);padding:4px 12px;border-radius:100px;font-size:12px;}
  .rev-list{display:flex;flex-direction:column;gap:12px;}
  .rev-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px 20px;}
  .rev-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
  .rev-from{font-weight:700;font-size:13px;}
  .rev-stars{font-size:13px;}
  .rev-route{font-size:12px;color:rgba(232,244,240,0.4);margin-bottom:6px;}
  .rev-comment{font-size:13px;color:rgba(232,244,240,0.6);font-style:italic;}
  .empty{text-align:center;padding:50px 20px;}
  .empty-icon{font-size:2.2rem;margin-bottom:10px;}
  .empty p{font-size:14px;color:rgba(232,244,240,0.3);}
  .loading-d{text-align:center;padding:80px;}
  .spin{display:inline-block;width:32px;height:32px;border:3px solid rgba(0,230,118,0.15);border-top-color:#00e676;border-radius:50%;animation:spin 0.8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
`;