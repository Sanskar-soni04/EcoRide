// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

function trim(str, n=3){ return str?(str.split(',').map(s=>s.trim()).slice(0,n).join(', ')):'' }

function RequestModal({ride,onClose}){
  const [msg,setMsg]=useState('');const [sent,setSent]=useState(false);const [loading,setLoading]=useState(false);
  const send=async()=>{setLoading(true);try{await api.post('/rides/'+ride._id+'/request',{message:msg});}catch{}setSent(true);setLoading(false);};
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
  const [from,setFrom]=useState('');const [to,setTo]=useState('');const [date,setDate]=useState('');
  const [rides,setRides]=useState([]);const [loading,setLoading]=useState(false);const [searched,setSearched]=useState(false);const [selected,setSelected]=useState(null);
  const fetchRides=async(params={})=>{setLoading(true);setSearched(true);try{const{data}=await api.get('/rides',{params});setRides(data);}catch{setRides([]);}finally{setLoading(false);}};
  useEffect(()=>{fetchRides();},[]);
  const search=e=>{e.preventDefault();const p={};if(from)p.from=from;if(to)p.to=to;if(date)p.date=date;fetchRides(p);};
  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      .sp{min-height:100vh;background:#050a0e;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;padding:48px 24px 80px;}
      .sp-inner{max-width:900px;margin:0 auto;}
      .sp-head{margin-bottom:32px;}.sp-head h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:6px;}.sp-head h1 span{color:#00e676;}.sp-head p{color:rgba(232,244,240,0.4);font-size:15px;font-weight:300;}
      .sbar{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:20px 24px;display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:14px;align-items:end;margin-bottom:36px;}
      @media(max-width:680px){.sbar{grid-template-columns:1fr;}}
      .sf{display:flex;flex-direction:column;gap:6px;}.sf label{font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(232,244,240,0.35);}
      .sf input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:11px 14px;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;}
      .sf input:focus{border-color:rgba(0,230,118,0.4);}.sf input::placeholder{color:rgba(232,244,240,0.2);}.sf input::-webkit-calendar-picker-indicator{filter:invert(0.6);cursor:pointer;}
      .btn-s{background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:12px 24px;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.25s;height:46px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,230,118,0.3);}
      .btn-s:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,230,118,0.45);}
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
        <div className="sf"><label>From</label><input placeholder="Starting point" value={from} onChange={e=>setFrom(e.target.value)}/></div>
        <div className="sf"><label>To</label><input placeholder="Destination" value={to} onChange={e=>setTo(e.target.value)}/></div>
        <div className="sf"><label>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
        <button className="btn-s" type="submit">Search →</button>
      </form>
      {loading?<div className="lst"><div className="spin"/><p>Finding rides…</p></div>
      :searched&&rides.length===0?<div className="est"><div className="est-icon">🛣️</div><h3>No rides found</h3><p>Try different filters or check back soon.</p></div>
      :<><div className="rhdr"><h2>Available rides</h2><span className="rcnt">{rides.length} found</span></div>
        {Array.isArray(rides) && rides.map((ride) => (
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
              {ride.postedBy?.name&&<span className="pby">by {ride.postedBy.name}</span>}
            </div>
          </div>
        ))}
      </>}
    </div></div>
    {selected&&<RequestModal ride={selected} onClose={()=>setSelected(null)}/>}
  </>);
}