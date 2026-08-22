import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── Feature card data ─────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🔐',
    title: '10-Second Dynamic QR',
    description:
      'Cryptographically secured AES-256 codes that expire every 10 seconds — neutralising screenshot sharing and replay attacks completely.',
    tag: 'Anti-Screenshot',
  },
  {
    icon: '📱',
    title: 'Anti-Proxy Enforcement',
    description:
      'Advanced device fingerprinting ensures one device equals one attendance mark. Any shared-device attempt is instantly flagged to the teacher.',
    tag: 'Device Binding',
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    description:
      'Millisecond-level WebSocket syncing gives teachers a live feed of who walked in. Historical analytics highlight at-risk students automatically.',
    tag: 'Live Monitoring',
  },
];

/* ─── Animated counter hook ─────────────────────────────────────────────── */
const useCountUp = (target, duration = 1400) => {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString();
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return ref;
};

/* ─── Main component ────────────────────────────────────────────────────── */
const LandingPage = () => {
  const refSessions = useCountUp(12400);
  const refStudents = useCountUp(3200);
  const refAccuracy = useCountUp(99);

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION A: Navbar
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-24 py-16">
          {/* Logo */}
          <Link to="/" id="nav-logo" className="flex items-center gap-10 group">
            <div className="w-36 h-36 bg-primary rounded-md flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <span className="text-white text-[18px]">⚡</span>
            </div>
            <span className="text-heading font-bold text-primary tracking-tight">QuickPass</span>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-12">
            <Link
              to="/login"
              id="nav-login"
              className="text-body font-semibold text-text-secondary hover:text-accent transition-colors duration-150 px-12 py-8"
            >
              Log In
            </Link>
            <Link
              to="/register"
              id="nav-signup"
              className="btn-primary btn-sm rounded-lg"
            >
              Sign Up Free →
            </Link>
          </div>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION B: Hero
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0056d2 0%, transparent 70%)' }}
        />

        <div className="max-w-6xl mx-auto px-24 pt-80 pb-64 flex flex-col items-center text-center relative z-10">
          {/* Eyebrow pill */}
          <span className="inline-flex items-center gap-8 px-16 py-6 bg-accent-light text-accent text-label font-semibold rounded-xl border border-accent border-opacity-20 mb-24 animate-fade-in">
            <span className="w-6 h-6 rounded-full bg-accent animate-pulse" />
            Now with AES-256 encrypted QR codes
          </span>

          {/* Headline */}
          <h1
            className="font-bold text-primary leading-tight mb-20 animate-slide-up"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', maxWidth: '820px' }}
          >
            Eliminate Proxy Fraud with{' '}
            <span className="text-gradient">Cryptographic Attendance.</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-text-secondary mb-40 animate-slide-up"
            style={{ fontSize: '18px', lineHeight: '1.7', maxWidth: '600px', animationDelay: '80ms' }}
          >
            The highly scalable, one-device-one-scan QR ecosystem built for modern campuses
            and smart cities. Every code expires in 10 seconds.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-16 mb-64 animate-slide-up" style={{ animationDelay: '160ms' }}>
            <Link
              to="/register"
              id="hero-cta"
              className="btn-primary btn-lg rounded-xl text-[16px] shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-200"
            >
              Get Started — It's Free
            </Link>
            <Link
              to="/login"
              id="hero-login"
              className="btn-secondary btn-lg rounded-xl text-[16px] hover:-translate-y-[2px] transition-all duration-200"
            >
              Log in to Dashboard
            </Link>
          </div>

          {/* ── Dashboard preview placeholder ───────────────────────────── */}
          <div
            className="w-full max-w-4xl rounded-xl overflow-hidden border border-border shadow-lg animate-fade-in bg-surface"
            style={{ animationDelay: '240ms' }}
          >
            {/* Fake browser chrome */}
            <div className="bg-primary flex items-center gap-8 px-16 py-12">
              <span className="w-12 h-12 rounded-full bg-red-500 opacity-80" />
              <span className="w-12 h-12 rounded-full bg-yellow-400 opacity-80" />
              <span className="w-12 h-12 rounded-full bg-green-500 opacity-80" />
              <div className="flex-1 ml-16 bg-white bg-opacity-10 rounded-sm h-20 max-w-xs" />
            </div>

            {/* Fake dashboard layout */}
            <div className="bg-background p-24 grid grid-cols-4 gap-16 min-h-[260px]">
              {/* Sidebar strip */}
              <div className="col-span-1 bg-primary rounded-lg p-12 flex flex-col gap-10">
                <div className="w-full h-10 bg-white bg-opacity-20 rounded-sm" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-24 bg-white bg-opacity-10 rounded-sm" />
                ))}
              </div>

              {/* Main area */}
              <div className="col-span-3 flex flex-col gap-16">
                {/* Stat row */}
                <div className="grid grid-cols-3 gap-12">
                  {['12,400+', '3,200+', '99%'].map((v, i) => (
                    <div key={i} className="bg-surface shadow-card rounded-md p-12">
                      <div className="text-[11px] text-text-muted mb-4 font-medium uppercase tracking-wide">
                        {['Sessions', 'Students', 'Accuracy'][i]}
                      </div>
                      <div className="text-[22px] font-bold text-gradient">{v}</div>
                    </div>
                  ))}
                </div>

                {/* QR placeholder block */}
                <div className="flex gap-12 flex-1">
                  <div className="bg-surface shadow-card rounded-md p-16 flex items-center justify-center flex-1">
                    <div className="flex flex-col items-center gap-8 opacity-40">
                      <div className="w-80 h-80 border-2 border-accent rounded-md grid grid-cols-4 grid-rows-4 gap-2 p-4">
                        {[...Array(16)].map((_, i) => (
                          <div key={i} className={`rounded-[2px] ${Math.random() > 0.4 ? 'bg-primary' : 'bg-transparent'}`} />
                        ))}
                      </div>
                      <p className="text-label text-text-muted">Live QR • refreshes in 8s</p>
                    </div>
                  </div>
                  <div className="bg-surface shadow-card rounded-md p-16 flex-1 flex flex-col gap-8">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className="w-24 h-24 rounded-full bg-accent-light" />
                          <div className="w-80 h-10 bg-border rounded-sm" />
                        </div>
                        <div className="w-40 h-16 bg-green-100 rounded-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Stats strip
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary py-40">
        <div className="max-w-4xl mx-auto px-24 grid grid-cols-3 gap-32 text-center">
          {[
            { ref: refSessions, suffix: '+', label: 'Sessions Recorded' },
            { ref: refStudents, suffix: '+', label: 'Students Protected' },
            { ref: refAccuracy, suffix: '%',  label: 'Detection Accuracy' },
          ].map(({ ref, suffix, label }) => (
            <div key={label}>
              <p className="text-white font-bold mb-4" style={{ fontSize: '36px' }}>
                <span ref={ref}>0</span>{suffix}
              </p>
              <p className="text-white text-opacity-50 text-label font-medium uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION C: Feature Cards
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-80 px-24 bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Section label */}
          <p className="text-center text-label font-semibold text-accent tracking-widest uppercase mb-12">
            Why QuickPass
          </p>
          <h2 className="text-center text-primary font-bold mb-48" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
            Every layer designed to make fraud impossible.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                id={`feature-card-${i + 1}`}
                className="bg-surface rounded-xl p-32 flex flex-col gap-16 group hover:-translate-y-[4px] transition-all duration-250 animate-fade-in"
                style={{
                  boxShadow: 'rgb(0, 86, 210) 0px 0px 0px 1px inset',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* Icon */}
                <div className="w-48 h-48 bg-accent-light rounded-lg flex items-center justify-center text-[24px] group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>

                {/* Tag pill */}
                <span className="badge-info self-start">{f.tag}</span>

                {/* Title */}
                <h3 className="text-heading text-primary font-semibold leading-snug">{f.title}</h3>

                {/* Description */}
                <p className="text-body text-text-secondary leading-relaxed flex-1">{f.description}</p>

                {/* Subtle arrow */}
                <span className="text-accent text-label font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Learn more →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA Banner
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-accent py-64 px-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-bold mb-16" style={{ fontSize: 'clamp(22px, 3vw, 34px)' }}>
            Ready to secure your classroom?
          </h2>
          <p className="text-white text-opacity-80 text-body mb-32">
            Set up in under 2 minutes. Seed demo data and you're live instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-16">
            <Link
              to="/register"
              id="cta-banner-register"
              className="px-32 py-16 bg-white text-accent font-bold rounded-xl text-[16px] hover:bg-opacity-90 hover:-translate-y-[2px] transition-all duration-200 shadow-md"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              id="cta-banner-login"
              className="px-32 py-16 bg-transparent text-white font-semibold rounded-xl text-[16px] border border-white border-opacity-40 hover:bg-white hover:bg-opacity-10 hover:-translate-y-[2px] transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION D: Footer
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-primary py-24 px-24">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-12">
          {/* Left */}
          <div className="flex items-center gap-10">
            <span className="text-white text-[18px]">⚡</span>
            <p className="text-white text-opacity-50 text-label">
              © 2026 QuickPass. All rights reserved.
            </p>
          </div>

          {/* Right */}
          <p className="text-white text-opacity-40 text-label">
            Built by{' '}
            <span className="text-white text-opacity-70 font-semibold">Lokesh Saini</span>
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
