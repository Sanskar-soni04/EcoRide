// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const ROLES = [
  { value: 'driver',    label: 'Driver',    icon: '🚗', desc: 'I own a vehicle and want to offer rides' },
  { value: 'passenger', label: 'Passenger', icon: '🎒', desc: 'I want to find and join rides' },
];
const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Auto', 'Other'];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [role, setRole]       = useState('');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone]     = useState('');
  const [vType,   setVType]   = useState('Car');
  const [vModel,  setVModel]  = useState('');
  const [vNumber, setVNumber] = useState('');
  const [vColor,  setVColor]  = useState('');
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  const fullEmail = email.includes('@') ? email : (email ? `${email}@glbitm.ac.in` : '');

  const validateStep1 = () => {
    if (!role)               return 'Please select your role.';
    if (!name.trim())        return 'Name is required.';
    if (!email.trim())       return 'Email is required.';
    if (!fullEmail.endsWith('@glbitm.ac.in')) return 'Only @glbitm.ac.in emails are allowed.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setMsg({ type: 'error', text: err }); return; }
    setMsg(null);
    if (role === 'driver') setStep(2);
    else submit();
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    setLoading(true); setMsg(null);
    try {
      const payload = {
        name: name.trim(), email: fullEmail, password, phone: phone.trim(), role,
        ...(role === 'driver' && { vehicle: { type: vType, model: vModel.trim(), number: vNumber.trim().toUpperCase(), color: vColor.trim() } }),
      };
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Registration failed.' });
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .reg-page{min-height:100vh;background:#050a0e;display:flex;align-items:center;justify-content:center;padding:48px 20px;font-family:'Plus Jakarta Sans',sans-serif;}
        .reg-card{width:100%;max-width:480px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:28px;padding:40px;box-shadow:0 24px 80px rgba(0,0,0,0.4);}
        .reg-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px;}
        .reg-logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#00e676,#26c6da);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,230,118,0.4);}
        .reg-logo-name{font-size:17px;font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#fff,#b2f5d8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .steps{display:flex;align-items:center;gap:0;margin-bottom:28px;}
        .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;transition:all 0.3s;border:2px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.3);}
        .step-dot.active{background:linear-gradient(135deg,#00e676,#26c6da);border-color:transparent;color:#050a0e;box-shadow:0 3px 12px rgba(0,230,118,0.4);}
        .step-dot.done{background:rgba(0,230,118,0.15);border-color:rgba(0,230,118,0.3);color:#00e676;}
        .step-line{flex:1;height:2px;background:rgba(255,255,255,0.07);margin:0 6px;}
        .step-line.done{background:rgba(0,230,118,0.3);}
        .reg-title{font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;color:#e8f4f0;margin-bottom:6px;}
        .reg-sub{font-size:14px;color:rgba(232,244,240,0.4);font-weight:300;margin-bottom:24px;}
        .role-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
        .role-card{border:1.5px solid rgba(255,255,255,0.09);border-radius:16px;padding:16px;cursor:pointer;transition:all 0.25s;background:rgba(255,255,255,0.02);}
        .role-card:hover{border-color:rgba(0,230,118,0.3);background:rgba(0,230,118,0.04);}
        .role-card.selected{border-color:#00e676;background:rgba(0,230,118,0.08);box-shadow:0 4px 20px rgba(0,230,118,0.15);}
        .role-icon{font-size:1.6rem;margin-bottom:8px;}
        .role-label{font-size:14px;font-weight:700;color:#e8f4f0;margin-bottom:3px;}
        .role-desc{font-size:11px;color:rgba(232,244,240,0.4);font-weight:300;line-height:1.4;}
        .fgroup{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
        .flabel{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,244,240,0.35);}
        .frow{display:flex;align-items:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:13px;overflow:hidden;transition:border-color 0.2s;}
        .frow:focus-within{border-color:rgba(0,230,118,0.45);}
        .finput{flex:1;background:transparent;border:none;outline:none;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;padding:12px 14px;}
        .finput::placeholder{color:rgba(232,244,240,0.2);}
        .fsuffix{padding:0 14px;font-size:13px;color:rgba(232,244,240,0.3);font-weight:500;white-space:nowrap;border-left:1px solid rgba(255,255,255,0.07);}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .vtype-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;}
        .vtab{padding:6px 14px;border-radius:100px;font-size:12px;font-weight:600;border:1.5px solid rgba(255,255,255,0.09);color:rgba(232,244,240,0.4);cursor:pointer;transition:all 0.2s;background:transparent;}
        .vtab.active{background:rgba(0,230,118,0.1);border-color:#00e676;color:#00e676;}
        .msg{border-radius:12px;padding:11px 16px;font-size:13px;font-weight:500;margin-bottom:14px;}
        .msg.error{background:rgba(239,83,80,0.1);color:#ff8a80;border:1px solid rgba(239,83,80,0.2);}
        .msg.success{background:rgba(0,230,118,0.1);color:#00e676;border:1px solid rgba(0,230,118,0.2);}
        .btn-main{width:100%;background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:14px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 18px rgba(0,230,118,0.35);margin-top:6px;}
        .btn-main:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,230,118,0.5);}
        .btn-main:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .btn-back{width:100%;background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.5);padding:12px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;cursor:pointer;transition:all 0.2s;margin-top:10px;}
        .btn-back:hover{border-color:rgba(255,255,255,0.2);color:#e8f4f0;}
        .reg-footer{text-align:center;margin-top:20px;font-size:13px;color:rgba(232,244,240,0.35);}
        .reg-footer a{color:#00e676;text-decoration:none;font-weight:600;}
        .domain-hint{font-size:11px;color:rgba(0,230,118,0.6);margin-top:4px;font-weight:500;}
      `}</style>
      <div className="reg-page"><div className="reg-card">
        <div className="reg-logo">
          <div className="reg-logo-mark">
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
              <path d="M13 3C13 3 6 7.5 6 14C6 17.86 9.14 21 13 21C16.86 21 20 17.86 20 14C20 7.5 13 3 13 3Z" fill="rgba(5,10,14,0.82)"/>
              <line x1="13" y1="3" x2="13" y2="19.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="13" y1="10" x2="16.5" y2="7.5" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" strokeLinecap="round"/>
              <line x1="13" y1="13.5" x2="9.5" y2="11" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" strokeLinecap="round"/>
              <line x1="3.5" y1="15" x2="7" y2="15" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="2.5" y1="18" x2="6.5" y2="18" stroke="rgba(255,255,255,0.38)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="reg-logo-name">EcoRide</span>
        </div>
        {role === 'driver' && (
          <div className="steps">
            <div className={`step-dot ${step>=1?(step>1?'done':'active'):''}`}>1</div>
            <div className={`step-line ${step>1?'done':''}`}/>
            <div className={`step-dot ${step>=2?'active':''}`}>2</div>
          </div>
        )}
        {step===1?<>
          <div className="reg-title">Create account</div>
          <div className="reg-sub">Join EcoRide — glbitm.ac.in students only</div>
          {msg&&<div className={`msg ${msg.type}`}>{msg.text}</div>}
          <div className="flabel" style={{marginBottom:10}}>I am a</div>
          <div className="role-grid">
            {ROLES.map(r=>(
              <div key={r.value} className={`role-card ${role===r.value?'selected':''}`} onClick={()=>setRole(r.value)}>
                <div className="role-icon">{r.icon}</div>
                <div className="role-label">{r.label}</div>
                <div className="role-desc">{r.desc}</div>
              </div>
            ))}
          </div>
          <div className="fgroup"><label className="flabel">Full name</label><div className="frow"><input className="finput" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></div></div>
          <div className="fgroup">
            <label className="flabel">College email</label>
            <div className="frow">
              <input className="finput" placeholder="username" value={email} onChange={e=>setEmail(e.target.value.replace('@glbitm.ac.in','').replace('@',''))}/>
              <span className="fsuffix">@glbitm.ac.in</span>
            </div>
            {email&&<div className="domain-hint">✓ {fullEmail}</div>}
          </div>
          <div className="fgroup"><label className="flabel">Phone number</label><div className="frow"><input className="finput" placeholder="10-digit number" value={phone} onChange={e=>setPhone(e.target.value)} maxLength={10}/></div></div>
          <div className="fgroup"><label className="flabel">Password</label><div className="frow"><input className="finput" type="password" placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/></div></div>
          <button className="btn-main" onClick={handleNext} disabled={loading}>{role==='driver'?'Next: Add Vehicle →':(loading?'Creating…':'Create Account →')}</button>
        </>:<>
          <div className="reg-title">Your vehicle</div>
          <div className="reg-sub">Passengers will see these details</div>
          {msg&&<div className={`msg ${msg.type}`}>{msg.text}</div>}
          <div className="fgroup"><label className="flabel">Vehicle type</label><div className="vtype-tabs">{VEHICLE_TYPES.map(t=><div key={t} className={`vtab ${vType===t?'active':''}`} onClick={()=>setVType(t)}>{t}</div>)}</div></div>
          <div className="fgroup"><label className="flabel">Model name</label><div className="frow"><input className="finput" placeholder="e.g. Honda City, Activa" value={vModel} onChange={e=>setVModel(e.target.value)}/></div></div>
          <div className="two-col">
            <div className="fgroup"><label className="flabel">Number plate</label><div className="frow"><input className="finput" placeholder="UP16 AB 1234" value={vNumber} onChange={e=>setVNumber(e.target.value)}/></div></div>
            <div className="fgroup"><label className="flabel">Color</label><div className="frow"><input className="finput" placeholder="White, Black…" value={vColor} onChange={e=>setVColor(e.target.value)}/></div></div>
          </div>
          <button className="btn-main" onClick={submit} disabled={loading}>{loading?'Creating account…':'🚗 Complete Registration →'}</button>
          <button className="btn-back" onClick={()=>{setStep(1);setMsg(null);}}>← Back</button>
        </>}
        <div className="reg-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div></div>
    </>
  );
}