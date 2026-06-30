// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location    = useLocation();
  const navigate    = useNavigate();
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => { setIsLoggedIn(!!localStorage.getItem('token')); setMenuOpen(false); }, [location]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setIsLoggedIn(false); navigate('/login'); };

  const navLinks = isLoggedIn
    ? [{to:'/',label:'Home'},{to:'/search',label:'Search'},{to:'/dashboard',label:'Dashboard'},{to:'/profile',label:'Profile'},{to:'/about',label:'About'}]
    : [{to:'/',label:'Home'},{to:'/about',label:'About'}];

  const isActive = p => p==='/'?location.pathname==='/':location.pathname.startsWith(p);

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      .hdr{position:sticky;top:0;z-index:1000;width:100%;padding:10px 28px;display:flex;align-items:center;justify-content:space-between;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);background:linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 50%,rgba(0,230,118,0.04) 100%);backdrop-filter:blur(40px) saturate(200%) brightness(110%);-webkit-backdrop-filter:blur(40px) saturate(200%) brightness(110%);border-bottom:1px solid rgba(255,255,255,0.08);box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 4px 24px rgba(0,0,0,0.3);}
      .hdr.scrolled{background:linear-gradient(135deg,rgba(5,10,14,0.75) 0%,rgba(10,18,24,0.7) 100%);backdrop-filter:blur(60px) saturate(250%) brightness(105%);-webkit-backdrop-filter:blur(60px) saturate(250%) brightness(105%);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),0 8px 40px rgba(0,0,0,0.5);}
      .hdr::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(0,230,118,0.8) 40%,rgba(38,198,218,0.8) 60%,transparent 100%);background-size:300% 100%;background-position:-100% 0;animation:sweep 6s ease-in-out infinite;}
      @keyframes sweep{0%{background-position:-100% 0}100%{background-position:300% 0}}

      .hdr-logo{display:flex;align-items:center;gap:11px;text-decoration:none;flex-shrink:0;}
      .logo-mark{width:44px;height:44px;border-radius:14px;flex-shrink:0;background:linear-gradient(145deg,#00e676 0%,#00c853 45%,#26c6da 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,230,118,0.45),inset 0 1px 0 rgba(255,255,255,0.35);position:relative;overflow:hidden;transition:all 0.35s cubic-bezier(0.16,1,0.3,1);}
      .logo-mark::after{content:'';position:absolute;top:0;left:0;right:0;height:52%;background:linear-gradient(180deg,rgba(255,255,255,0.3) 0%,transparent 100%);border-radius:14px 14px 0 0;}
      .hdr-logo:hover .logo-mark{transform:rotate(-8deg) scale(1.1);box-shadow:0 8px 30px rgba(0,230,118,0.65);}
      .logo-name{font-size:18px;font-weight:800;letter-spacing:-0.04em;line-height:1;background:linear-gradient(135deg,#ffffff 0%,#b2f5d8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
      .logo-sub{font-size:9.5px;color:rgba(232,244,240,0.28);font-weight:500;letter-spacing:0.1em;text-transform:uppercase;margin-top:2px;display:block;}

      .hdr-nav{display:flex;align-items:center;background:linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.03) 100%);border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:5px 6px;gap:2px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:inset 0 1px 0 rgba(255,255,255,0.13),inset 0 -1px 0 rgba(0,0,0,0.1),0 4px 20px rgba(0,0,0,0.2);}
      .nav-link{padding:8px 20px;border-radius:100px;font-size:13.5px;font-weight:500;letter-spacing:-0.01em;color:rgba(232,244,240,0.5);text-decoration:none;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);white-space:nowrap;}
      .nav-link:hover{color:rgba(232,244,240,0.95);background:rgba(255,255,255,0.07);}
      .nav-link.active{color:#050a0e;font-weight:700;background:linear-gradient(135deg,#00e676 0%,#26c6da 100%);box-shadow:0 2px 16px rgba(0,230,118,0.5),inset 0 1px 0 rgba(255,255,255,0.3);}

      .hdr-actions{display:flex;align-items:center;gap:10px;}
      .btn-post{display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,#00e676 0%,#26c6da 100%);color:#050a0e;border:none;padding:9px 22px;border-radius:100px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13.5px;letter-spacing:-0.02em;cursor:pointer;text-decoration:none;box-shadow:0 4px 18px rgba(0,230,118,0.4),inset 0 1px 0 rgba(255,255,255,0.25);transition:all 0.3s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden;}
      .btn-post::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);opacity:0;transition:opacity 0.2s;}
      .btn-post:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,230,118,0.55);}
      .btn-post:hover::before{opacity:1;}
      .btn-logout{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:rgba(232,244,240,0.45);padding:8px 18px;border-radius:100px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.25s;backdrop-filter:blur(12px);}
      .btn-logout:hover{border-color:rgba(239,83,80,0.35);color:#ff8a80;background:rgba(239,83,80,0.07);}
      .btn-login{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(232,244,240,0.6);padding:8px 20px;border-radius:100px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;text-decoration:none;transition:all 0.25s;backdrop-filter:blur(12px);}
      .btn-login:hover{border-color:rgba(0,230,118,0.35);color:#00e676;background:rgba(0,230,118,0.07);}

      .hdr-burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:9px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:11px;backdrop-filter:blur(12px);transition:all 0.2s;}
      .hdr-burger:hover{background:rgba(255,255,255,0.1);}
      .bline{width:20px;height:1.5px;background:rgba(232,244,240,0.75);border-radius:2px;transition:all 0.35s cubic-bezier(0.16,1,0.3,1);transform-origin:center;}
      .hdr-burger.open .bline:nth-child(1){transform:rotate(45deg) translate(4.5px,4.5px);}
      .hdr-burger.open .bline:nth-child(2){opacity:0;transform:scaleX(0);}
      .hdr-burger.open .bline:nth-child(3){transform:rotate(-45deg) translate(4.5px,-4.5px);}

      .mob-menu{position:fixed;top:68px;left:10px;right:10px;background:linear-gradient(160deg,rgba(8,16,22,0.97) 0%,rgba(5,10,14,0.99) 100%);backdrop-filter:blur(50px) saturate(200%);-webkit-backdrop-filter:blur(50px) saturate(200%);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:12px;display:flex;flex-direction:column;gap:3px;z-index:998;box-shadow:0 20px 60px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.1);transform:translateY(-12px) scale(0.97);opacity:0;pointer-events:none;transition:all 0.35s cubic-bezier(0.16,1,0.3,1);}
      .mob-menu.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}
      .mob-link{display:flex;align-items:center;padding:12px 16px;border-radius:13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:500;color:rgba(232,244,240,0.55);text-decoration:none;transition:all 0.2s;letter-spacing:-0.01em;}
      .mob-link:hover{background:rgba(255,255,255,0.06);color:rgba(232,244,240,0.9);}
      .mob-link.active{background:rgba(0,230,118,0.1);color:#00e676;font-weight:600;}
      .mob-divider{height:1px;background:rgba(255,255,255,0.06);margin:6px 4px;}
      .mob-bottom{display:flex;gap:8px;padding:4px;}
      .mob-bottom .btn-post{flex:1;justify-content:center;}
      .mob-bottom .btn-logout{flex:1;text-align:center;}
      .mob-bottom .btn-login{flex:1;text-align:center;}
      @media(max-width:800px){.hdr-nav{display:none;}.btn-post,.btn-logout,.btn-login{display:none;}.hdr-burger{display:flex;}}
    `}</style>

    <header className={`hdr ${scrolled?'scrolled':''}`}>
      <Link to="/" className="hdr-logo">
        <div className="logo-mark">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M13 3C13 3 6 7.5 6 14C6 17.86 9.14 21 13 21C16.86 21 20 17.86 20 14C20 7.5 13 3 13 3Z" fill="rgba(5,10,14,0.82)"/>
            <line x1="13" y1="3" x2="13" y2="19.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" strokeLinecap="round"/>
            <line x1="13" y1="10" x2="16.5" y2="7.5" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" strokeLinecap="round"/>
            <line x1="13" y1="13.5" x2="9.5" y2="11" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" strokeLinecap="round"/>
            <line x1="3.5" y1="15" x2="7" y2="15" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="2.5" y1="18" x2="6.5" y2="18" stroke="rgba(255,255,255,0.38)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div className="logo-name">EcoRide</div>
          <span className="logo-sub">Green commute · Campus</span>
        </div>
      </Link>

      <nav className="hdr-nav">
        {navLinks.map(l=>(
          <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to)?'active':''}`}>{l.label}</Link>
        ))}
      </nav>

      <div className="hdr-actions">
        {isLoggedIn ? (<>
          <Link to="/post-ride" className="btn-post">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Post Ride
          </Link>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </>) : (<>
          <Link to="/login"    className="btn-login">Sign in</Link>
          <Link to="/register" className="btn-post">Get Started</Link>
        </>)}
        <div className={`hdr-burger ${menuOpen?'open':''}`} onClick={()=>setMenuOpen(o=>!o)}>
          <span className="bline"/><span className="bline"/><span className="bline"/>
        </div>
      </div>
    </header>

    <div className={`mob-menu ${menuOpen?'open':''}`}>
      {navLinks.map(l=>(
        <Link key={l.to} to={l.to} className={`mob-link ${isActive(l.to)?'active':''}`}>{l.label}</Link>
      ))}
      <div className="mob-divider"/>
      <div className="mob-bottom">
        {isLoggedIn?(<>
          <Link to="/post-ride" className="btn-post">+ Post Ride</Link>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </>):(<>
          <Link to="/login" className="btn-login">Sign in</Link>
          <Link to="/register" className="btn-post">Get Started</Link>
        </>)}
      </div>
    </div>
  </>);
}