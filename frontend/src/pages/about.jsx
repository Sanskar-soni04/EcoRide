// src/pages/about.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function useInView(threshold = 0.2) {
  const ref  = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

const values = [
  { icon: '🎓', title: 'Students First',    desc: 'Built exclusively for campus students. Every feature is designed around how students actually commute — flexible, affordable, and social.' },
  { icon: '🌿', title: 'Eco Conscious',     desc: 'Every shared ride directly reduces carbon emissions. We track and celebrate the collective environmental impact of our community.' },
  { icon: '🔒', title: 'Verified & Safe',   desc: 'College email verification ensures only real students access the platform. Trust is the foundation of every ride on EcoRide.' },
  { icon: '💸', title: 'Fair Cost Sharing', desc: 'Automated per-km fare splitting means no awkward negotiations. Drivers cover fuel costs, riders get affordable transport. Everyone wins.' },
];

const milestones = [
  { year: '2024',    label: 'Idea born',        desc: 'Noticed how many students drove alone daily — the waste of both money and fuel sparked the concept.' },
  { year: 'Jan \'25', label: 'MVP built',       desc: 'Three IT students built the first working prototype in under a month during semester break.' },
  { year: 'Feb \'25', label: 'Campus launch',   desc: 'Launched on campus. First 50 users signed up in 48 hours. First ride shared within 3 days.' },
  { year: 'Now',     label: '1,200+ riders',    desc: 'Growing community of verified students saving money and cutting emissions together every single day.' },
];

export default function About() {
  const navigate = useNavigate();
  const [heroRef,    heroVisible]    = useInView(0.1);
  const [valuesRef,  valuesVisible]  = useInView(0.15);
  const [timeRef,    timeVisible]    = useInView(0.15);
  const [teamRef,    teamVisible]    = useInView(0.15);
  const [missionRef, missionVisible] = useInView(0.15);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .about-page {
          min-height: 100vh;
          background: #050a0e;
          color: #e8f4f0;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── fade-up animation ── */
        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .fade-up.d1 { transition-delay: 0.1s; }
        .fade-up.d2 { transition-delay: 0.2s; }
        .fade-up.d3 { transition-delay: 0.3s; }
        .fade-up.d4 { transition-delay: 0.4s; }

        /* ── HERO ── */
        .ab-hero {
          position: relative;
          padding: 100px 24px 80px;
          text-align: center;
          overflow: hidden;
        }

        .ab-hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,230,118,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 60%, rgba(38,198,218,0.05) 0%, transparent 60%);
        }

        .ab-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,230,118,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,230,118,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%);
        }

        .ab-hero-inner {
          position: relative;
          max-width: 760px;
          margin: 0 auto;
        }

        .section-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(0,230,118,0.08);
          border: 1px solid rgba(0,230,118,0.2);
          color: #00e676;
          padding: 5px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .chip-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00e676;
          animation: chipPulse 2s ease-in-out infinite;
        }
        @keyframes chipPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }

        .ab-hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #e8f4f0;
          margin-bottom: 20px;
        }
        .ab-hero h1 .g  { color: #00e676; }
        .ab-hero h1 .t  { color: #26c6da; }

        .ab-hero-desc {
          font-size: clamp(15px, 2vw, 17px);
          color: rgba(232,244,240,0.55);
          line-height: 1.75;
          font-weight: 300;
          max-width: 560px;
          margin: 0 auto 36px;
        }

        .ab-hero-cta {
          display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
        }

        .btn-g {
          background: #00e676; color: #050a0e; border: none;
          padding: 13px 30px; border-radius: 50px;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(0,230,118,0.3);
        }
        .btn-g:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,230,118,0.45); }

        .btn-outline {
          background: transparent; color: rgba(232,244,240,0.65);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 13px 30px; border-radius: 50px;
          font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px;
          cursor: pointer; transition: all 0.25s;
        }
        .btn-outline:hover { border-color: rgba(0,230,118,0.4); color: #00e676; }

        /* ── MISSION ── */
        .mission-section {
          padding: 80px 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .mission-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
        }
        @media(max-width:760px){ .mission-inner { grid-template-columns: 1fr; gap: 40px; } }

        .mission-text .section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          color: #00e676; text-transform: uppercase; margin-bottom: 14px;
          font-family: 'Syne', sans-serif;
        }
        .mission-text h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem,4vw,2.6rem); font-weight: 800;
          letter-spacing: -0.02em; color: #e8f4f0; margin-bottom: 18px; line-height: 1.15;
        }
        .mission-text h2 span { color: #00e676; }
        .mission-text p {
          color: rgba(232,244,240,0.5); font-size: 15px;
          line-height: 1.8; font-weight: 300; margin-bottom: 14px;
        }

        /* big stat blocks */
        .mission-stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .ms-block {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 24px 20px; text-align: center;
          transition: all 0.3s;
        }
        .ms-block:hover { transform: translateY(-4px); border-color: rgba(0,230,118,0.2); }
        .ms-block .ms-val {
          font-family: 'Syne', sans-serif; font-size: 2.2rem;
          font-weight: 800; color: #00e676; letter-spacing: -0.03em;
        }
        .ms-block:nth-child(even) .ms-val { color: #26c6da; }
        .ms-block .ms-lbl {
          font-size: 12px; color: rgba(232,244,240,0.4); margin-top: 4px; font-weight: 300;
        }

        /* ── VALUES ── */
        .values-section {
          padding: 80px 24px;
          background: rgba(0,230,118,0.015);
          border-top: 1px solid rgba(0,230,118,0.07);
          border-bottom: 1px solid rgba(0,230,118,0.07);
        }
        .values-inner { max-width: 1100px; margin: 0 auto; }

        .sec-head { text-align: center; margin-bottom: 52px; }
        .sec-head .section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          color: #00e676; text-transform: uppercase; margin-bottom: 12px;
          font-family: 'Syne', sans-serif; display: block;
        }
        .sec-head h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem,4vw,2.6rem); font-weight: 800;
          letter-spacing: -0.02em; color: #e8f4f0;
        }

        .values-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(230px,1fr)); gap: 22px;
        }
        .val-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px 24px;
          transition: all 0.3s;
        }
        .val-card:hover {
          transform: translateY(-6px);
          border-color: rgba(0,230,118,0.2);
          background: rgba(0,230,118,0.04);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .val-icon { font-size: 2rem; margin-bottom: 14px; }
        .val-card h3 {
          font-family: 'Syne', sans-serif; font-size: 1.05rem;
          font-weight: 700; color: #e8f4f0; margin-bottom: 10px;
        }
        .val-card p { font-size: 14px; color: rgba(232,244,240,0.45); line-height: 1.7; font-weight: 300; }

        /* ── TIMELINE ── */
        .timeline-section { padding: 80px 24px; }
        .timeline-inner { max-width: 860px; margin: 0 auto; }

        .timeline {
          position: relative; margin-top: 52px;
          padding-left: 32px;
        }
        .timeline::before {
          content: '';
          position: absolute; left: 0; top: 8px; bottom: 8px;
          width: 2px;
          background: linear-gradient(to bottom, #00e676, rgba(38,198,218,0.3), transparent);
          border-radius: 2px;
        }

        .tl-item {
          position: relative; padding: 0 0 40px 36px;
          opacity: 0; transform: translateX(-16px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .tl-item.visible { opacity: 1; transform: translateX(0); }
        .tl-item.d1 { transition-delay: 0.1s; }
        .tl-item.d2 { transition-delay: 0.2s; }
        .tl-item.d3 { transition-delay: 0.3s; }
        .tl-item.d4 { transition-delay: 0.4s; }

        .tl-dot {
          position: absolute; left: -36px; top: 6px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #00e676;
          box-shadow: 0 0 0 4px rgba(0,230,118,0.2);
        }

        .tl-year {
          font-family: 'Syne', sans-serif; font-size: 11px;
          font-weight: 700; letter-spacing: 0.1em;
          color: #00e676; text-transform: uppercase; margin-bottom: 4px;
        }
        .tl-label {
          font-family: 'Syne', sans-serif; font-size: 1.1rem;
          font-weight: 700; color: #e8f4f0; margin-bottom: 8px;
        }
        .tl-desc { font-size: 14px; color: rgba(232,244,240,0.45); line-height: 1.7; font-weight: 300; }

        /* ── TEAM ── */
        .team-section {
          padding: 80px 24px;
          background: rgba(38,198,218,0.015);
          border-top: 1px solid rgba(38,198,218,0.07);
        }
        .team-inner { max-width: 1100px; margin: 0 auto; }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px,1fr));
          gap: 24px; margin-top: 52px;
        }

        .team-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px; padding: 32px 24px;
          text-align: center;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          position: relative; overflow: hidden;
        }
        .team-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #00e676, transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .team-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0,230,118,0.2);
          background: rgba(0,230,118,0.04);
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }
        .team-card:hover::before { opacity: 1; }

        .team-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #00e676, #26c6da);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 22px; color: #050a0e;
          margin: 0 auto 16px;
          box-shadow: 0 8px 24px rgba(0,230,118,0.3);
          position: relative;
        }
        .team-avatar::after {
          content: '';
          position: absolute; inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
        }

        .team-name {
          font-family: 'Syne', sans-serif; font-size: 1.1rem;
          font-weight: 800; color: #e8f4f0; margin-bottom: 4px;
        }
        .team-role {
          font-size: 13px; color: #00e676; font-weight: 500; margin-bottom: 8px;
        }
        .team-year {
          font-size: 12px; color: rgba(232,244,240,0.3);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 4px 14px; border-radius: 100px; display: inline-block;
        }

        /* ── CTA ── */
        .ab-cta {
          padding: 100px 24px; text-align: center; position: relative; overflow: hidden;
        }
        .ab-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,230,118,0.06) 0%, transparent 70%);
        }
        .ab-cta h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem,5vw,3.2rem); font-weight: 800;
          color: #e8f4f0; letter-spacing: -0.03em;
          margin-bottom: 14px; position: relative;
        }
        .ab-cta p {
          color: rgba(232,244,240,0.45); font-size: 15px;
          margin-bottom: 36px; font-weight: 300; position: relative;
        }
        .ab-cta-btns {
          display: flex; gap: 14px; justify-content: center;
          flex-wrap: wrap; position: relative;
        }
      `}</style>

      <div className="about-page">

        {/* ── HERO ── */}
        <section className="ab-hero" ref={heroRef}>
          <div className="ab-hero-bg" />
          <div className="ab-grid" />
          <div className="ab-hero-inner">
            <div className={`fade-up ${heroVisible ? 'visible' : ''}`}>
              <div className="section-chip"><span className="chip-dot" />Our Story</div>
            </div>
            <div className={`fade-up d1 ${heroVisible ? 'visible' : ''}`}>
              <h1>
                Built by students,<br />
                <span className="g">for students</span>
              </h1>
            </div>
            <div className={`fade-up d2 ${heroVisible ? 'visible' : ''}`}>
              <p className="ab-hero-desc">
                EcoRide started with a simple observation — too many students were driving
                alone every day while their classmates took the same route. We built the
                platform to fix that: verified, affordable, and eco-conscious campus carpooling.
              </p>
            </div>
            <div className={`fade-up d3 ${heroVisible ? 'visible' : ''}`}>
              <div className="ab-hero-cta">
                <button className="btn-g" onClick={() => navigate('/register')}>Join EcoRide →</button>
                <button className="btn-outline" onClick={() => navigate('/')}>See the platform</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── MISSION ── */}
        <section className="mission-section" ref={missionRef}>
          <div className="mission-inner">
            <div className={`mission-text fade-up ${missionVisible ? 'visible' : ''}`}>
              <div className="section-label">Our mission</div>
              <h2>Make every campus commute <span>smarter</span></h2>
              <p>
                We believe the daily campus commute is broken — expensive for students,
                congested for campuses, and terrible for the planet. EcoRide fixes all three
                with one simple solution: verified peer-to-peer ride sharing.
              </p>
              <p>
                No surge pricing. No stranger danger. No unnecessary emissions.
                Just students helping students get from A to B — safely and affordably.
              </p>
            </div>

            <div className={`mission-stats fade-up d2 ${missionVisible ? 'visible' : ''}`}>
              {[
                { val: '1,200+', lbl: 'Verified students' },
                { val: '2,847',  lbl: 'Rides shared' },
                { val: '14 T',   lbl: 'CO₂ saved' },
                { val: '₹3.8L',  lbl: 'Fuel costs split' },
              ].map((s, i) => (
                <div className="ms-block" key={i}>
                  <div className="ms-val">{s.val}</div>
                  <div className="ms-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="values-section" ref={valuesRef}>
          <div className="values-inner">
            <div className="sec-head">
              <span className="section-label">What we stand for</span>
              <h2>Our core values</h2>
            </div>
            <div className="values-grid">
              {values.map((v, i) => (
                <div
                  key={i}
                  className={`val-card fade-up d${i + 1} ${valuesVisible ? 'visible' : ''}`}
                >
                  <div className="val-icon">{v.icon}</div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="timeline-section" ref={timeRef}>
          <div className="timeline-inner">
            <div className="sec-head">
              <span className="section-label">How we got here</span>
              <h2>Our journey</h2>
            </div>
            <div className="timeline">
              {milestones.map((m, i) => (
                <div key={i} className={`tl-item d${i+1} ${timeVisible ? 'visible' : ''}`}>
                  <div className="tl-dot" />
                  <div className="tl-year">{m.year}</div>
                  <div className="tl-label">{m.label}</div>
                  <div className="tl-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="team-section" ref={teamRef}>
          <div className="team-inner">
            <div className="sec-head">
              <span className="section-label">The people behind it</span>
              <h2>Meet the team</h2>
            </div>
            <div className="team-grid">
              {[
                { name: 'Sanskar Soni',  initials: 'SS', role: 'Full-stack Developer',  year: 'IT — 2nd Year' },
                { name: 'Suyash Dubey',  initials: 'SD', role: 'Backend & DB Engineer', year: 'IT — 2nd Year' },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`team-card fade-up d${i + 1} ${teamVisible ? 'visible' : ''}`}
                >
                  <div className="team-avatar">{m.initials}</div>
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                  <span className="team-year">{m.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ab-cta">
          <h2>Ready to ride smarter?</h2>
          <p>Join your classmates already saving money and cutting emissions every day.</p>
          <div className="ab-cta-btns">
            <button className="btn-g"      onClick={() => navigate('/register')}>Get Started Free →</button>
            <button className="btn-outline" onClick={() => navigate('/search')}>Browse Rides</button>
          </div>
        </section>

      </div>
    </>
  );
}