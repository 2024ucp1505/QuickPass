import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🔐',
    title: '10-Second Dynamic QR',
    description: 'AES-256 codes that expire every 10 seconds — neutralising screenshot sharing and replay attacks completely.',
    tag: 'Anti-Screenshot',
  },
  {
    icon: '📱',
    title: 'Anti-Proxy Enforcement',
    description: 'Device fingerprinting ensures one device equals one attendance mark. Shared-device attempts are instantly flagged.',
    tag: 'Device Binding',
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    description: 'WebSocket syncing gives teachers a live feed as students scan. Historical analytics highlight at-risk students.',
    tag: 'Live Monitoring',
  },
];

const useCountUp = (target, duration = 1400) => {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString();
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return ref;
};

const LandingPage = () => {
  const refSessions = useCountUp(12400);
  const refStudents = useCountUp(3200);
  const refAccuracy = useCountUp(99);

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">

      {/* ══════════════════════════════════════════
          NAVBAR — hidden on mobile, visible on md+
      ══════════════════════════════════════════ */}
      <header className="hidden md:block sticky top-0 z-50 glass border-b border-border">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <Link to="/" id="nav-logo" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <span className="text-white text-lg">⚡</span>
            </div>
            <span className="font-bold text-lg text-primary tracking-tight">QuickPass</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" id="nav-login" className="text-sm font-semibold text-text-secondary hover:text-accent transition-colors px-3 py-2">
              Log In
            </Link>
            <Link to="/register" id="nav-signup" className="btn-primary btn-sm rounded-lg">
              Sign Up Free →
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════════════
          HERO — full-bleed on mobile
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0056d2 0%, transparent 70%)' }}
        />

        <div className="max-w-4xl mx-auto px-5 pt-14 pb-12 md:pt-20 md:pb-16 flex flex-col items-center text-center relative z-10">

          {/* Eyebrow pill */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-light text-accent text-xs font-semibold rounded-full border border-accent border-opacity-20 mb-5 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AES-256 encrypted QR codes
          </span>

          {/* Headline */}
          <h1
            className="font-bold text-primary leading-tight mb-4 animate-slide-up"
            style={{ fontSize: 'clamp(28px, 6vw, 52px)', maxWidth: '780px' }}
          >
            Eliminate Proxy Fraud with{' '}
            <span className="text-gradient">Cryptographic Attendance.</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-text-secondary mb-8 animate-slide-up"
            style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: '1.7', maxWidth: '540px', animationDelay: '80ms' }}
          >
            One-device-one-scan QR ecosystem built for modern campuses. Every code expires in 10 seconds.
          </p>

          {/* CTA buttons — stacked on mobile, side-by-side on md+ */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto mb-10 animate-slide-up"
            style={{ animationDelay: '160ms' }}
          >
            <Link to="/register" id="hero-cta" className="btn-primary btn-lg rounded-xl text-base shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-200 text-center">
              Get Started — It's Free
            </Link>
            <Link to="/login" id="hero-login" className="btn-secondary btn-lg rounded-xl text-base hover:-translate-y-[2px] transition-all duration-200 text-center">
              Log in to Dashboard
            </Link>
          </div>

          {/* Dashboard preview — desktop only */}
          <div
            className="hidden md:block w-full max-w-4xl rounded-xl overflow-hidden border border-border shadow-lg animate-fade-in bg-surface"
            style={{ animationDelay: '240ms' }}
          >
            {/* Fake browser chrome */}
            <div className="bg-primary flex items-center gap-2 px-4 py-3">
              <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
              <span className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
              <div className="flex-1 ml-4 bg-white bg-opacity-10 rounded-sm h-5 max-w-xs" />
            </div>
            {/* Fake dashboard layout */}
            <div className="bg-background p-6 grid grid-cols-4 gap-4 min-h-[220px]">
              <div className="col-span-1 bg-primary rounded-lg p-3 flex flex-col gap-2.5">
                <div className="w-full h-2.5 bg-white bg-opacity-20 rounded-sm" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-6 bg-white bg-opacity-10 rounded-sm" />
                ))}
              </div>
              <div className="col-span-3 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  {['12,400+', '3,200+', '99%'].map((v, i) => (
                    <div key={i} className="bg-surface shadow-card rounded-md p-3">
                      <div className="text-[10px] text-text-muted mb-1 font-medium uppercase tracking-wide">{['Sessions', 'Students', 'Accuracy'][i]}</div>
                      <div className="text-[18px] font-bold text-gradient">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 flex-1">
                  <div className="bg-surface shadow-card rounded-md p-4 flex items-center justify-center flex-1">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <div className="w-16 h-16 border-2 border-accent rounded-md grid grid-cols-4 grid-rows-4 gap-0.5 p-1">
                        {[...Array(16)].map((_, i) => (
                          <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-primary' : 'bg-transparent'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-text-muted">Live QR • refreshes in 8s</p>
                    </div>
                  </div>
                  <div className="bg-surface shadow-card rounded-md p-4 flex-1 flex flex-col gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent-light" />
                          <div className="w-20 h-2.5 bg-border rounded-sm" />
                        </div>
                        <div className="w-10 h-4 bg-green-100 rounded-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section className="bg-primary py-10">
        <div className="max-w-3xl mx-auto px-5 grid grid-cols-3 gap-4 text-center">
          {[
            { ref: refSessions, suffix: '+', label: 'Sessions' },
            { ref: refStudents, suffix: '+', label: 'Students' },
            { ref: refAccuracy, suffix: '%', label: 'Accuracy' },
          ].map(({ ref, suffix, label }) => (
            <div key={label}>
              <p className="text-white font-bold mb-1" style={{ fontSize: 'clamp(22px, 5vw, 36px)' }}>
                <span ref={ref}>0</span>{suffix}
              </p>
              <p className="text-white text-opacity-60 text-xs font-medium uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="py-14 px-5 bg-background">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-accent tracking-widest uppercase mb-3">Why QuickPass</p>
          <h2 className="text-center text-primary font-bold mb-10" style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>
            Every layer designed to make fraud impossible.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                id={`feature-card-${i + 1}`}
                className="bg-surface rounded-xl p-6 flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-250 animate-fade-in"
                style={{ boxShadow: 'rgb(0, 86, 210) 0px 0px 0px 1px inset', animationDelay: `${i * 80}ms` }}
              >
                <div className="w-11 h-11 bg-accent-light rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <span className="badge-info self-start">{f.tag}</span>
                <h3 className="text-heading text-primary font-semibold leading-snug">{f.title}</h3>
                <p className="text-body text-text-secondary leading-relaxed flex-1">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="bg-accent py-14 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white font-bold mb-3" style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>
            Ready to secure your classroom?
          </h2>
          <p className="text-white text-opacity-80 text-base mb-7">
            Set up in under 2 minutes. Seed demo data and you're live instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              to="/register"
              id="cta-banner-register"
              className="px-8 py-4 bg-white text-accent font-bold rounded-xl text-base hover:bg-opacity-90 hover:-translate-y-[2px] transition-all duration-200 shadow-md text-center"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              id="cta-banner-login"
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl text-base border border-white border-opacity-40 hover:bg-white hover:bg-opacity-10 hover:-translate-y-[2px] transition-all duration-200 text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-primary py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-white text-lg">⚡</span>
            <p className="text-white text-opacity-50 text-sm">© 2026 QuickPass. All rights reserved.</p>
          </div>
          <p className="text-white text-opacity-40 text-sm">
            Built by <span className="text-white text-opacity-70 font-semibold">Lokesh Saini</span>
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
