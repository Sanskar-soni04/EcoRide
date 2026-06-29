// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Animated counter hook
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ icon, value, suffix, label, color, started }) {
  const count = useCounter(value, 2200, started);
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-value" style={{ color }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function FloatingParticle({ style }) {
  return <div className="particle" style={style} />;
}

export default function Home() {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 17 + 5) % 100}%`,
    top: `${(i * 23 + 10) % 100}%`,
    width: `${4 + (i % 5) * 3}px`,
    height: `${4 + (i % 5) * 3}px`,
    animationDelay: `${i * 0.4}s`,
    animationDuration: `${6 + (i % 4) * 2}s`,
    opacity: 0.15 + (i % 3) * 0.08,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #050a0e;
          color: #e8f4f0;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        .home-wrap {
          min-height: 100vh;
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 80px 24px 60px;
        }

        .hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,230,118,0.08) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 50% at 80% 20%, rgba(0,188,212,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse 40% 40% at 20% 80%, rgba(0,230,118,0.04) 0%, transparent 60%);
        }

        .grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,230,118,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,230,118,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: #00e676;
          animation: float linear infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: inherit; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.05; }
        }

        .hero-content {
          position: relative;
          text-align: center;
          max-width: 860px;
          z-index: 2;
          animation: heroIn 0.9s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes heroIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,230,118,0.1);
          border: 1px solid rgba(0,230,118,0.25);
          color: #00e676;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          margin-bottom: 28px;
          font-family: 'DM Sans', sans-serif;
        }

        .badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #00e676;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        .hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #e8f4f0;
          margin-bottom: 22px;
        }

        .hero h1 .green { color: #00e676; }
        .hero h1 .teal  { color: #26c6da; }

        .hero p {
          font-size: clamp(1rem, 2.2vw, 1.2rem);
          color: rgba(232,244,240,0.6);
          max-width: 560px;
          margin: 0 auto 40px;
          line-height: 1.7;
          font-weight: 300;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: #00e676;
          color: #050a0e;
          border: none;
          padding: 14px 32px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.02em;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.15);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,230,118,0.35); }
        .btn-primary:hover::after { opacity: 1; }

        .btn-secondary {
          background: transparent;
          color: #e8f4f0;
          border: 1px solid rgba(232,244,240,0.2);
          padding: 14px 32px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.25s ease;
        }

        .btn-secondary:hover {
          border-color: rgba(0,230,118,0.4);
          color: #00e676;
          transform: translateY(-2px);
        }

        /* ── STATS ── */
        .stats-section {
          padding: 80px 24px;
          position: relative;
        }

        .section-label {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #00e676;
          text-transform: uppercase;
          margin-bottom: 12px;
          font-family: 'Syne', sans-serif;
        }

        .section-title {
          text-align: center;
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          color: #e8f4f0;
          margin-bottom: 52px;
          letter-spacing: -0.02em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px 28px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          opacity: 0.3;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(0,230,118,0.2);
          background: rgba(0,230,118,0.04);
        }

        .stat-icon { font-size: 2rem; margin-bottom: 12px; }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2.6rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }
        .stat-label { font-size: 14px; color: rgba(232,244,240,0.5); font-weight: 300; }

        /* ── CARBON SECTION ── */
        .carbon-section {
          padding: 80px 24px;
          background: rgba(0,230,118,0.02);
          border-top: 1px solid rgba(0,230,118,0.08);
          border-bottom: 1px solid rgba(0,230,118,0.08);
        }

        .carbon-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .carbon-inner { grid-template-columns: 1fr; gap: 40px; }
        }

        .carbon-text h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          color: #e8f4f0;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 18px;
        }

        .carbon-text h2 span { color: #00e676; }

        .carbon-text p {
          color: rgba(232,244,240,0.55);
          font-size: 15px;
          line-height: 1.75;
          font-weight: 300;
          margin-bottom: 28px;
        }

        .impact-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,230,118,0.08);
          border: 1px solid rgba(0,230,118,0.18);
          color: #00e676;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
        }

        /* Carbon visual */
        .carbon-visual {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meter-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meter-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: rgba(232,244,240,0.6);
        }

        .meter-track {
          height: 10px;
          background: rgba(255,255,255,0.05);
          border-radius: 100px;
          overflow: hidden;
        }

        .meter-fill {
          height: 100%;
          border-radius: 100px;
          animation: fillBar 2s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: var(--delay, 0s);
        }

        @keyframes fillBar {
          from { width: 0; }
        }

        /* ── HOW IT WORKS ── */
        .how-section {
          padding: 80px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 28px;
          margin-top: 52px;
        }

        .step-card {
          position: relative;
          padding: 32px 24px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          background: rgba(255,255,255,0.02);
          transition: all 0.3s ease;
        }

        .step-card:hover {
          border-color: rgba(38,198,218,0.25);
          transform: translateY(-5px);
          background: rgba(38,198,218,0.04);
        }

        .step-num {
          font-family: 'Syne', sans-serif;
          font-size: 3rem;
          font-weight: 800;
          color: rgba(0,230,118,0.12);
          position: absolute;
          top: 16px; right: 20px;
          letter-spacing: -0.05em;
        }

        .step-icon {
          font-size: 1.8rem;
          margin-bottom: 16px;
        }

        .step-card h3 {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #e8f4f0;
          margin-bottom: 10px;
        }

        .step-card p {
          font-size: 14px;
          color: rgba(232,244,240,0.45);
          line-height: 1.65;
          font-weight: 300;
        }

        /* ── SAVINGS CALC ── */
        .savings-section {
          padding: 80px 24px;
          background: rgba(38,198,218,0.02);
          border-top: 1px solid rgba(38,198,218,0.08);
        }

        .savings-inner {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }

        .calc-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px;
          margin-top: 40px;
        }

        .calc-slider-wrap {
          margin: 28px 0;
          text-align: left;
        }

        .calc-slider-wrap label {
          font-size: 14px;
          color: rgba(232,244,240,0.6);
          display: block;
          margin-bottom: 10px;
          font-weight: 300;
        }

        .calc-slider {
          width: 100%;
          accent-color: #00e676;
          cursor: pointer;
        }

        .calc-results {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 28px;
        }

        @media (max-width: 480px) {
          .calc-results { grid-template-columns: 1fr; }
        }

        .calc-result-card {
          background: rgba(0,230,118,0.06);
          border: 1px solid rgba(0,230,118,0.15);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }

        .calc-result-card.teal-card {
          background: rgba(38,198,218,0.06);
          border-color: rgba(38,198,218,0.15);
        }

        .calc-result-val {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #00e676;
          letter-spacing: -0.03em;
        }

        .calc-result-card.teal-card .calc-result-val { color: #26c6da; }

        .calc-result-label {
          font-size: 12px;
          color: rgba(232,244,240,0.5);
          margin-top: 4px;
          font-weight: 300;
        }

        /* ── CTA FOOTER ── */
        .cta-section {
          padding: 100px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,230,118,0.06) 0%, transparent 70%);
        }

        .cta-section h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          color: #e8f4f0;
          letter-spacing: -0.03em;
          margin-bottom: 18px;
          position: relative;
        }

        .cta-section p {
          color: rgba(232,244,240,0.5);
          font-size: 16px;
          margin-bottom: 36px;
          font-weight: 300;
          position: relative;
        }
      `}</style>

      <div className="home-wrap">

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="grid-lines" />
          {particles.map((p, i) => <FloatingParticle key={i} style={p} />)}

          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot" />
              Campus-verified rides only
            </div>
            <h1>
              Ride smarter.<br />
              Save <span className="green">money</span>.<br />
              Go <span className="teal">greener</span>.
            </h1>
            <p>
              EcoRide connects verified campus students for daily carpooling —
              split fuel costs, cut carbon emissions, and never miss a ride again.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => navigate('/post-ride')}>
                🚗 Post a Ride
              </button>
              <button className="btn-secondary" onClick={() => navigate('/search')}>
                🔍 Find a Ride
              </button>
            </div>
          </div>
        </section>

        {/* LIVE STATS */}
        <section className="stats-section" ref={statsRef}>
          <div className="section-label">Community impact</div>
          <div className="section-title">Numbers that matter</div>
          <div className="stats-grid">
            <StatCard icon="🚗" value={2847} suffix="+" label="Rides Shared" color="#00e676" started={statsVisible} />
            <StatCard icon="🌿" value={14200} suffix=" kg" label="CO₂ Saved" color="#00e676" started={statsVisible} />
            <StatCard icon="💰" value={380000} suffix=" ₹" label="Fuel Costs Saved" color="#26c6da" started={statsVisible} />
            <StatCard icon="👥" value={1240} suffix="+" label="Students Active" color="#26c6da" started={statsVisible} />
          </div>
        </section>

        {/* CARBON FOOTPRINT */}
        <section className="carbon-section">
          <div className="carbon-inner">
            <div className="carbon-text">
              <div className="section-label">Sustainability</div>
              <h2>Every shared ride<br /><span>fights climate change</span></h2>
              <p>
                A single student carpooling just 5 days a week saves an average of 1.2 tonnes
                of CO₂ per year — equivalent to planting 55 trees. On campus scale, that's a
                forest grown every semester.
              </p>
              <div className="impact-pills">
                <span className="pill">🌱 55 trees / student / year</span>
                <span className="pill">⛽ 40% less fuel burn</span>
                <span className="pill">🏙️ Less campus congestion</span>
              </div>
            </div>

            <div className="carbon-visual">
              {[
                { label: 'Solo commute (avg)', val: '100%', fill: 92, color: '#ef5350', delay: '0s' },
                { label: 'EcoRide carpool (2 people)', val: '50%', fill: 48, color: '#ffa726', delay: '0.2s' },
                { label: 'EcoRide carpool (4 people)', val: '25%', fill: 25, color: '#00e676', delay: '0.4s' },
              ].map((row, i) => (
                <div className="meter-row" key={i}>
                  <div className="meter-label">
                    <span>{row.label}</span>
                    <span style={{ color: row.color, fontWeight: 600 }}>{row.val} emissions</span>
                  </div>
                  <div className="meter-track">
                    <div
                      className="meter-fill"
                      style={{
                        width: `${row.fill}%`,
                        background: row.color,
                        '--delay': row.delay,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section">
          <div className="section-label">Simple process</div>
          <div className="section-title">How EcoRide works</div>
          <div className="steps-grid">
            {[
              { icon: '🎓', title: 'Verify your campus email', desc: 'Sign up with your college email. Only verified students get access — keeping rides safe and trusted.', n: '01' },
              { icon: '📍', title: 'Post or search rides', desc: 'Drivers post their route, time, and available seats. Riders browse and request the perfect match.', n: '02' },
              { icon: '🤝', title: 'Connect & confirm', desc: 'Match with a verified co-rider. Contact details shared securely. Confirm with OTP for trust.', n: '03' },
              { icon: '💸', title: 'Split & save', desc: 'Fuel costs split automatically per km. Pay only for what you use. No surge pricing, ever.', n: '04' },
            ].map((s, i) => (
              <div className="step-card" key={i}>
                <span className="step-num">{s.n}</span>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SAVINGS CALCULATOR */}
        <SavingsCalc />

        {/* FINAL CTA */}
        <section className="cta-section">
          <h2>Ready to ride smarter?</h2>
          <p>Join 1,200+ students already saving money and the planet.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Get Started Free →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/about')}>
              Learn more
            </button>
          </div>
        </section>

      </div>
    </>
  );
}

function SavingsCalc() {
  const [km, setKm] = useState(15);
  const [days, setDays] = useState(5);
  const [riders, setRiders] = useState(3);

  const fuelPerKm = 7; // ₹ per km solo
  const co2PerKm = 0.21; // kg CO2 per km solo

  const monthlyKm = km * 2 * days * 4;
  const soloFuel = monthlyKm * fuelPerKm;
  const sharedFuel = soloFuel / riders;
  const moneySaved = soloFuel - sharedFuel;
  const co2Saved = (monthlyKm * co2PerKm * (riders - 1) / riders).toFixed(1);

  return (
    <section className="savings-section">
      <div className="savings-inner">
        <div className="section-label">Your impact</div>
        <div className="section-title">Calculate your savings</div>

        <div className="calc-box">
          {[
            { label: `Daily one-way distance: ${km} km`, val: km, set: setKm, min: 2, max: 60, step: 1 },
            { label: `Days per week: ${days}`, val: days, set: setDays, min: 1, max: 7, step: 1 },
            { label: `Riders in carpool: ${riders}`, val: riders, set: setRiders, min: 2, max: 6, step: 1 },
          ].map((s, i) => (
            <div className="calc-slider-wrap" key={i}>
              <label>{s.label}</label>
              <input
                type="range" className="calc-slider"
                min={s.min} max={s.max} step={s.step} value={s.val}
                onChange={e => s.set(Number(e.target.value))}
              />
            </div>
          ))}

          <div className="calc-results">
            <div className="calc-result-card">
              <div className="calc-result-val">₹{moneySaved.toLocaleString('en-IN')}</div>
              <div className="calc-result-label">Saved per month on fuel</div>
            </div>
            <div className="calc-result-card teal-card">
              <div className="calc-result-val">{co2Saved} kg</div>
              <div className="calc-result-label">CO₂ avoided per month</div>
            </div>
            <div className="calc-result-card">
              <div className="calc-result-val">₹{(moneySaved * 12).toLocaleString('en-IN')}</div>
              <div className="calc-result-label">Saved per year</div>
            </div>
            <div className="calc-result-card teal-card">
              <div className="calc-result-val">{(co2Saved * 12 / 21.7).toFixed(1)}</div>
              <div className="calc-result-label">Trees equivalent / year</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}