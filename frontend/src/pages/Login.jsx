import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const nav = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      const token = res.data?.token || res.data?.data?.token;
      const user  = res.data?.user  || res.data?.data?.user;
      if (!token) throw new Error('No token returned');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Welcome back!');
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .login-page{min-height:100vh;background:#050a0e;display:flex;align-items:center;justify-content:center;padding:48px 20px;font-family:'Plus Jakarta Sans',sans-serif;}
        .login-card{width:100%;max-width:420px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:28px;padding:40px;box-shadow:0 24px 80px rgba(0,0,0,0.4);}
        .login-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px;}
        .login-logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#00e676,#26c6da);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,230,118,0.4);}
        .login-logo-name{font-size:17px;font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#fff,#b2f5d8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .login-title{font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;color:#e8f4f0;margin-bottom:6px;}
        .login-sub{font-size:14px;color:rgba(232,244,240,0.4);font-weight:300;margin-bottom:24px;}
        .fgroup{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}
        .flabel{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(232,244,240,0.35);}
        .frow{display:flex;align-items:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:13px;overflow:hidden;transition:border-color 0.2s;}
        .frow:focus-within{border-color:rgba(0,230,118,0.45);}
        .finput{flex:1;background:transparent;border:none;outline:none;color:#e8f4f0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;padding:12px 14px;}
        .finput::placeholder{color:rgba(232,244,240,0.2);}
        .err-text{font-size:12px;color:#ff8a80;margin-top:4px;font-weight:500;}
        .btn-main{width:100%;background:linear-gradient(135deg,#00e676,#26c6da);color:#050a0e;border:none;padding:14px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 18px rgba(0,230,118,0.35);margin-top:6px;}
        .btn-main:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,230,118,0.5);}
        .btn-main:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .login-footer{text-align:center;margin-top:20px;font-size:13px;color:rgba(232,244,240,0.35);}
        .login-footer a{color:#00e676;text-decoration:none;font-weight:600;}
      `}</style>
      <div className="login-page"><div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
              <path d="M13 3C13 3 6 7.5 6 14C6 17.86 9.14 21 13 21C16.86 21 20 17.86 20 14C20 7.5 13 3 13 3Z" fill="rgba(5,10,14,0.82)"/>
              <line x1="13" y1="3" x2="13" y2="19.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="13" y1="10" x2="16.5" y2="7.5" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" strokeLinecap="round"/>
              <line x1="13" y1="13.5" x2="9.5" y2="11" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" strokeLinecap="round"/>
              <line x1="3.5" y1="15" x2="7" y2="15" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="2.5" y1="18" x2="6.5" y2="18" stroke="rgba(255,255,255,0.38)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="login-logo-name">EcoRide</span>
        </div>
        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to your EcoRide account</div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="fgroup">
            <label className="flabel">Email</label>
            <div className="frow">
              <input className="finput" placeholder="you@glbitm.ac.in" {...register('email',{required:'Email required'})} />
            </div>
            {errors.email && <div className="err-text">{errors.email.message}</div>}
          </div>
          <div className="fgroup">
            <label className="flabel">Password</label>
            <div className="frow">
              <input className="finput" type="password" placeholder="Enter your password" {...register('password',{required:'Password required'})} />
            </div>
            {errors.password && <div className="err-text">{errors.password.message}</div>}
          </div>
          <div style={{textAlign:'right',margin:'-6px 0 14px'}}>
            <Link to="/forgot-password" className="login-footer" style={{fontSize:'12px',color:'rgba(0,230,118,0.6)',textDecoration:'none',fontWeight:500}}>Forgot password?</Link>
          </div>
          <button className="btn-main" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <div className="login-footer" style={{marginTop:20}}>Don't have an account? <Link to="/register">Create one</Link></div>
      </div></div>
    </>
  );
}