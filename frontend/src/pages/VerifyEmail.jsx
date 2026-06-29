import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(email ? 'verify' : 'email');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedInEmail = user?.email || '';

  useEffect(() => {
    if (loggedInEmail && !email) {
      setEmail(loggedInEmail);
      setStep('verify');
    }
  }, [loggedInEmail]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleSendOTP = async () => {
    if (!email) return toast.error('Email is required');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      toast.success('OTP sent to your email');
      setStep('verify');
      setTimer(60);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 6) return toast.error('Enter a valid 6-digit OTP');
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, otp });
      toast.success('Email verified successfully!');
      // Update user in localStorage
      const updated = { ...user, emailVerified: true };
      localStorage.setItem('user', JSON.stringify(updated));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .vfy-page{min-height:100vh;background:#050a0e;display:flex;align-items:center;justify-content:center;padding:48px 20px;font-family:'Plus Jakarta Sans',sans-serif;}
        .vfy-card{width:100%;max-width:440px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:28px;padding:40px;box-shadow:0 24px 80px rgba(0,0,0,0.4);text-align:center;}
        .vfy-icon{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#00e676,#26c6da);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 4px 20px rgba(0,230,118,0.35);}
        .vfy-title{font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;color:#e8f4f0;margin-bottom:6px;}
        .vfy-sub{font-size:14px;color:rgba(232,244,240,0.4);font-weight:300;margin-bottom:24px;line-height:1.5;}
        .vfy-sub strong{color:rgba(232,244,240,0.7);font-weight:600;}
        .fgroup{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;text-align:left;}
        .flabel{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,244,240,0.35);}
        .frow{display:flex;align-items:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:13px;overflow:hidden;transition:border-color 0.2s;}
        .frow:focus-within{border-color:rgba(0,230,118,0.45);}
        .finput{flex:1;background:transparent;border:none;outline:none;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;padding:12px 14px;text-align:center;letter-spacing:6px;font-weight:700;}
        .finput::placeholder{color:rgba(232,244,240,0.2);letter-spacing:0;}
        .finput.normal{text-align:left;letter-spacing:0;font-weight:400;}
        .btn-main{width:100%;background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:14px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 18px rgba(0,230,118,0.35);margin-top:6px;}
        .btn-main:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,230,118,0.5);}
        .btn-main:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .btn-outline{width:100%;background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.5);padding:12px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;cursor:pointer;transition:all 0.2s;margin-top:10px;}
        .btn-outline:hover{border-color:rgba(255,255,255,0.2);color:#e8f4f0;}
        .btn-outline:disabled{opacity:0.4;cursor:not-allowed;}
        .vfy-footer{text-align:center;margin-top:20px;font-size:13px;color:rgba(232,244,240,0.35);}
        .vfy-footer a{color:#00e676;text-decoration:none;font-weight:600;}
        .otp-inputs{display:flex;gap:8px;justify-content:center;margin-bottom:20px;}
        .otp-box{width:48px;height:56px;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:12px;color:#e8f4f0;font-size:22px;font-weight:700;text-align:center;outline:none;transition:all 0.2s;font-family:'Plus Jakarta Sans',sans-serif;}
        .otp-box:focus{border-color:rgba(0,230,118,0.5);background:rgba(0,230,118,0.05);box-shadow:0 0 20px rgba(0,230,118,0.1);}
        .timer-text{font-size:13px;color:rgba(232,244,240,0.3);margin-bottom:16px;}
      `}</style>
      <div className="vfy-page"><div className="vfy-card">
        <div className="vfy-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(5,10,14,0.82)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12C22 17.52 17.52 22 12 22S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z"/>
            <path d="M16.24 7.76l-5.66 5.66-2.83-2.83"/>
          </svg>
        </div>

        {step === 'email' ? (<>
          <div className="vfy-title">Verify your email</div>
          <div className="vfy-sub">Enter your college email to receive a verification code</div>
          <div className="fgroup">
            <label className="flabel">College Email</label>
            <div className="frow">
              <input className="finput normal" placeholder="you@glbitm.ac.in" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <button className="btn-main" onClick={handleSendOTP} disabled={loading || !email}>
            {loading ? 'Sending…' : 'Send OTP →'}
          </button>
        </>) : (<>
          <div className="vfy-title">Enter OTP</div>
          <div className="vfy-sub">We sent a 6-digit code to <strong>{email}</strong></div>
          <div className="fgroup">
            <label className="flabel">Verification Code</label>
            <div className="frow">
              <input className="finput" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} />
            </div>
          </div>
          {timer > 0 ? (
            <div className="timer-text">Resend in {timer}s</div>
          ) : (
            <button className="btn-outline" onClick={handleSendOTP} disabled={loading}>
              Resend OTP
            </button>
          )}
          <button className="btn-main" onClick={handleVerify} disabled={loading || otp.length < 6}>
            {loading ? 'Verifying…' : 'Verify →'}
          </button>
          <button className="btn-outline" onClick={() => setStep('email')}>
            ← Change email
          </button>
        </>)}
        <div className="vfy-footer">
          <Link to="/dashboard">Go to Dashboard</Link>
        </div>
      </div></div>
    </>
  );
}
