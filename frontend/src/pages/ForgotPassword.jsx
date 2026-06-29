import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(60);
    const id = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset code sent to your email');
      setStep('otp');
      startTimer();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send code');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!otp || otp.length < 6) return toast.error('Enter valid OTP');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, password });
      toast.success('Password reset successful! Please login');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .fp-page{min-height:100vh;background:#050a0e;display:flex;align-items:center;justify-content:center;padding:48px 20px;font-family:'Plus Jakarta Sans',sans-serif;}
        .fp-card{width:100%;max-width:440px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:28px;padding:40px;box-shadow:0 24px 80px rgba(0,0,0,0.4);text-align:center;}
        .fp-icon{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#00e676,#26c6da);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 4px 20px rgba(0,230,118,0.35);}
        .fp-title{font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;color:#e8f4f0;margin-bottom:6px;}
        .fp-sub{font-size:14px;color:rgba(232,244,240,0.4);font-weight:300;margin-bottom:24px;line-height:1.5;}
        .fp-sub strong{color:rgba(232,244,240,0.7);font-weight:600;}
        .fgroup{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;text-align:left;}
        .flabel{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,244,240,0.35);}
        .frow{display:flex;align-items:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:13px;overflow:hidden;transition:border-color 0.2s;}
        .frow:focus-within{border-color:rgba(0,230,118,0.45);}
        .finput{flex:1;background:transparent;border:none;outline:none;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;padding:12px 14px;}
        .finput::placeholder{color:rgba(232,244,240,0.2);}
        .finput.otp{text-align:center;letter-spacing:6px;font-weight:700;}
        .btn-main{width:100%;background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:14px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 18px rgba(0,230,118,0.35);margin-top:6px;}
        .btn-main:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,230,118,0.5);}
        .btn-main:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .btn-outline{width:100%;background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.5);padding:12px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;cursor:pointer;transition:all 0.2s;margin-top:10px;}
        .btn-outline:hover{border-color:rgba(255,255,255,0.2);color:#e8f4f0;}
        .btn-outline:disabled{opacity:0.4;cursor:not-allowed;}
        .fp-footer{text-align:center;margin-top:20px;font-size:13px;color:rgba(232,244,240,0.35);}
        .fp-footer a{color:#00e676;text-decoration:none;font-weight:600;}
        .timer-text{font-size:13px;color:rgba(232,244,240,0.3);margin-bottom:16px;}
        .steps{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:24px;}
        .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;transition:all 0.3s;border:2px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.3);}
        .step-dot.active{background:linear-gradient(135deg,#00e676,#26c6da);border-color:transparent;color:#050a0e;box-shadow:0 3px 12px rgba(0,230,118,0.4);}
        .step-dot.done{background:rgba(0,230,118,0.15);border-color:rgba(0,230,118,0.3);color:#00e676;}
        .step-line{width:48px;height:2px;background:rgba(255,255,255,0.07);margin:0 6px;}
        .step-line.done{background:rgba(0,230,118,0.3);}
      `}</style>
      <div className="fp-page"><div className="fp-card">
        <div className="fp-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(5,10,14,0.82)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        <div className="steps">
          <div className={`step-dot ${step !== 'email' ? 'done' : 'active'}`}>1</div>
          <div className={`step-line ${step !== 'email' ? 'done' : ''}`}/>
          <div className={`step-dot ${step === 'otp' ? 'active' : step === 'reset' ? 'done' : ''}`}>2</div>
          <div className={`step-line ${step === 'reset' ? 'done' : ''}`}/>
          <div className={`step-dot ${step === 'reset' ? 'active' : ''}`}>3</div>
        </div>

        {step === 'email' ? (<>
          <div className="fp-title">Forgot password?</div>
          <div className="fp-sub">Enter your college email and we'll send a reset code</div>
          <div className="fgroup">
            <label className="flabel">College Email</label>
            <div className="frow">
              <input className="finput" placeholder="you@glbitm.ac.in" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <button className="btn-main" onClick={handleSendOTP} disabled={loading || !email}>
            {loading ? 'Sending…' : 'Send Reset Code →'}
          </button>
        </>) : step === 'otp' ? (<>
          <div className="fp-title">Check your email</div>
          <div className="fp-sub">Enter the 6-digit code sent to <strong>{email}</strong></div>
          <div className="fgroup">
            <label className="flabel">Reset Code</label>
            <div className="frow">
              <input className="finput otp" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} />
            </div>
          </div>
          {timer > 0 ? (
            <div className="timer-text">Resend in {timer}s</div>
          ) : (
            <button className="btn-outline" onClick={handleSendOTP} disabled={loading}>
              Resend Code
            </button>
          )}
          <button className="btn-main" onClick={() => { if (otp.length >= 6) setStep('reset'); else toast.error('Enter valid OTP'); }} disabled={otp.length < 6}>
            Continue →
          </button>
          <button className="btn-outline" onClick={() => setStep('email')}>
            ← Change email
          </button>
        </>) : (<>
          <div className="fp-title">Reset password</div>
          <div className="fp-sub">Choose a new password for your account</div>
          <div className="fgroup">
            <label className="flabel">New Password</label>
            <div className="frow">
              <input className="finput" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="fgroup">
            <label className="flabel">Confirm Password</label>
            <div className="frow">
              <input className="finput" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <button className="btn-main" onClick={handleReset} disabled={loading || password.length < 6 || password !== confirmPassword}>
            {loading ? 'Resetting…' : 'Reset Password →'}
          </button>
          <button className="btn-outline" onClick={() => { setStep('otp'); setPassword(''); setConfirmPassword(''); }}>
            ← Back
          </button>
        </>)}

        <div className="fp-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div></div>
    </>
  );
}
