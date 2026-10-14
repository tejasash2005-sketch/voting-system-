import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { electionAPI } from '../services/api';

const HomePage = () => {
  const [elections, setElections] = useState([]);
  const [stats, setStats] = useState({ elections: 0, voters: 0, votes: 0, countries: 0 });
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    electionAPI.getPublic().then(r => setElections(r.data.elections || [])).catch(() => {});
    // Animate counters
    const targets = { elections: 2847, voters: 1240000, votes: 890000, countries: 42 };
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setStats({
        elections: Math.floor(targets.elections * ease),
        voters: Math.floor(targets.voters * ease),
        votes: Math.floor(targets.votes * ease),
        countries: Math.floor(targets.countries * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: '🔒', title: 'Military-Grade Security', desc: 'End-to-end encryption with SHA-256 vote hashing, zero-knowledge proofs, and immutable audit trails protect every ballot.' },
    { icon: '📊', title: 'Real-Time Analytics', desc: 'Live dashboards show turnout rates, geographic distribution, and voting trends as they happen with millisecond precision.' },
    { icon: '🌐', title: 'Multi-Region Support', desc: 'Conduct elections across multiple jurisdictions, time zones, and languages with our globally distributed infrastructure.' },
    { icon: '✅', title: 'Voter Verification', desc: 'Multi-factor identity verification with national ID, biometric, and OTP confirmation ensures only eligible voters participate.' },
    { icon: '👁️', title: 'Transparent Observation', desc: 'International observers get read-only access with full audit capabilities, ensuring transparent and fair processes.' },
    { icon: '📱', title: 'Accessible Voting', desc: 'Vote from any device — desktop, tablet, or mobile — with a universally accessible interface meeting WCAG 2.1 standards.' },
  ];

  const testimonials = [
    { name: 'Dr. Amara Nwosu', role: 'Electoral Commissioner, Nigeria', text: 'VoteSecure Pro transformed our national elections. Turnout increased by 34% and fraud complaints dropped to zero.', avatar: 'AN' },
    { name: 'Prof. Elena Vasquez', role: 'Chief Observer, EU Elections', text: 'The integrity tools are unmatched. We could verify every vote independently without compromising voter anonymity.', avatar: 'EV' },
    { name: 'James Okafor', role: 'IT Director, City of Lagos', text: 'Deployed for our municipal elections in under a week. The support team was exceptional throughout the process.', avatar: 'JO' },
  ];

  const howItWorks = [
    { step: '01', title: 'Register & Verify', desc: 'Voters register with their national ID and get verified through our secure multi-step identity confirmation process.' },
    { step: '02', title: 'Receive Ballot Access', desc: 'Eligible voters receive secure access codes and notifications when their assigned elections open for voting.' },
    { step: '03', title: 'Cast Your Vote', desc: 'Vote securely from any device. Your ballot is encrypted immediately upon submission with your unique receipt code.' },
    { step: '04', title: 'Verify & Results', desc: 'Use your receipt to verify your vote was counted. Results are published transparently once the election closes.' },
  ];

  const filteredElections = elections.filter(e => activeTab === 'all' ? true : e.status === activeTab);

  return (
    <div className="homepage">
      <style>{`
        .homepage { font-family: 'Inter', sans-serif; }
        
        /* NAV */
        .hp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          background: rgba(10, 20, 50, 0.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 0 40px; display: flex; align-items: center; height: 72px;
        }
        .hp-nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .hp-nav-logo-icon {
          width: 44px; height: 44px; background: linear-gradient(135deg, #f59e0b, #ef4444);
          border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;
        }
        .hp-nav-logo-text { color: white; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }
        .hp-nav-logo-text span { color: #f59e0b; }
        .hp-nav-links { display: flex; gap: 4px; margin-left: 48px; flex: 1; }
        .hp-nav-link { color: rgba(255,255,255,0.7); text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 15px; font-weight: 500; transition: all 0.2s; }
        .hp-nav-link:hover { color: white; background: rgba(255,255,255,0.08); }
        .hp-nav-actions { display: flex; gap: 12px; align-items: center; }
        .hp-btn-ghost { color: rgba(255,255,255,0.8); text-decoration: none; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2); transition: all 0.2s; }
        .hp-btn-ghost:hover { background: rgba(255,255,255,0.1); color: white; }
        .hp-btn-cta { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 15px rgba(245,158,11,0.3); }
        .hp-btn-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(245,158,11,0.4); }

        /* HERO */
        .hp-hero {
          min-height: 100vh; position: relative; overflow: hidden;
          background: linear-gradient(160deg, #050d1f 0%, #0a1628 40%, #0f2147 100%);
          display: flex; align-items: center;
        }
        .hp-hero-bg {
          position: absolute; inset: 0; overflow: hidden;
        }
        .hp-hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .hp-hero-glow-1 {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
          top: -100px; right: -100px;
        }
        .hp-hero-glow-2 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%);
          bottom: -100px; left: -100px;
        }
        .hp-hero-content { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 120px 40px 80px; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hp-hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); padding: 8px 16px; border-radius: 20px; color: #f59e0b; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
        .hp-hero-badge span { width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.2)} }
        .hp-hero-title { font-size: 64px; font-weight: 900; line-height: 1.05; color: white; margin-bottom: 24px; font-family: 'Playfair Display', serif; }
        .hp-hero-title span { background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hp-hero-desc { font-size: 18px; color: rgba(255,255,255,0.65); line-height: 1.7; margin-bottom: 40px; }
        .hp-hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .hp-hero-btn-primary { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; text-decoration: none; box-shadow: 0 8px 30px rgba(245,158,11,0.3); transition: all 0.3s; }
        .hp-hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(245,158,11,0.4); }
        .hp-hero-btn-secondary { display: inline-flex; align-items: center; gap: 10px; color: white; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; text-decoration: none; border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; }
        .hp-hero-btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); }
        .hp-hero-trust { display: flex; gap: 24px; margin-top: 40px; flex-wrap: wrap; }
        .hp-hero-trust-item { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 13px; }
        .hp-hero-trust-item span { color: #10b981; }

        /* Hero visual */
        .hp-hero-visual { position: relative; }
        .hp-hero-card {
          background: rgba(255,255,255,0.05); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 28px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.4);
        }
        .hp-hero-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .hp-hero-card-title { color: white; font-weight: 700; font-size: 16px; }
        .hp-live-badge { background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.4); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
        .hp-live-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 1.5s infinite; }
        .hp-election-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .hp-election-item-title { color: white; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
        .hp-election-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .hp-election-meta span { color: rgba(255,255,255,0.5); font-size: 12px; }
        .hp-progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .hp-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #f59e0b, #ef4444); transition: width 1.5s ease; }
        .hp-vote-counter { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); border-radius: 12px; padding: 14px 18px; margin-top: 16px; display: flex; align-items: center; justify-content: space-between; }
        .hp-vote-counter-label { color: rgba(255,255,255,0.6); font-size: 13px; }
        .hp-vote-counter-value { color: #f59e0b; font-weight: 800; font-size: 22px; }

        /* STATS */
        .hp-stats { background: linear-gradient(135deg, #1a3a6b, #0f2147); padding: 80px 40px; }
        .hp-stats-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
        .hp-stat { text-align: center; }
        .hp-stat-value { font-size: 52px; font-weight: 900; color: white; line-height: 1; font-family: 'Playfair Display', serif; }
        .hp-stat-value span { color: #f59e0b; }
        .hp-stat-label { color: rgba(255,255,255,0.6); font-size: 15px; margin-top: 8px; font-weight: 500; }
        .hp-stat-icon { font-size: 28px; margin-bottom: 12px; }

        /* SECTION */
        .hp-section { padding: 100px 40px; }
        .hp-section-inner { max-width: 1200px; margin: 0 auto; }
        .hp-section-label { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
        .hp-section-title { font-size: 44px; font-weight: 900; color: #0f172a; margin-bottom: 16px; font-family: 'Playfair Display', serif; }
        .hp-section-title span { color: #1a3a6b; }
        .hp-section-desc { font-size: 18px; color: #64748b; max-width: 600px; line-height: 1.7; }
        .hp-section-header { margin-bottom: 60px; }

        /* FEATURES */
        .hp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .hp-feature-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .hp-feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #1a3a6b, #f59e0b); opacity: 0; transition: opacity 0.3s; }
        .hp-feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); border-color: transparent; }
        .hp-feature-card:hover::before { opacity: 1; }
        .hp-feature-icon { font-size: 36px; margin-bottom: 20px; }
        .hp-feature-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .hp-feature-desc { color: #64748b; font-size: 14px; line-height: 1.7; }

        /* HOW IT WORKS */
        .hp-hiw { background: #f8fafc; }
        .hp-hiw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; position: relative; }
        .hp-hiw-grid::before { content: ''; position: absolute; top: 40px; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, #1a3a6b, #f59e0b); z-index: 0; }
        .hp-hiw-item { text-align: center; position: relative; z-index: 1; }
        .hp-hiw-step {
          width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 24px;
          background: linear-gradient(135deg, #1a3a6b, #2563eb); display: flex; align-items: center; justify-content: center;
          color: white; font-size: 22px; font-weight: 900; border: 4px solid white;
          box-shadow: 0 8px 25px rgba(26,58,107,0.3);
        }
        .hp-hiw-title { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .hp-hiw-desc { color: #64748b; font-size: 14px; line-height: 1.6; }

        /* ELECTIONS SHOWCASE */
        .hp-elections-tabs { display: flex; gap: 8px; margin-bottom: 32px; }
        .hp-tab { padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: 2px solid #e2e8f0; background: white; color: #64748b; transition: all 0.2s; }
        .hp-tab.active { background: #1a3a6b; color: white; border-color: #1a3a6b; }
        .hp-elections-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .hp-election-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; transition: all 0.3s; }
        .hp-election-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .hp-election-card-img { height: 160px; position: relative; overflow: hidden; }
        .hp-election-card-img-bg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 64px; }
        .hp-election-card-status { position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .hp-election-card-status.active { background: #d1fae5; color: #065f46; }
        .hp-election-card-status.upcoming { background: #dbeafe; color: #1e40af; }
        .hp-election-card-status.completed { background: #f1f5f9; color: #475569; }
        .hp-election-card-body { padding: 20px; }
        .hp-election-card-type { font-size: 11px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .hp-election-card-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; line-height: 1.3; }
        .hp-election-card-meta { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 14px; }
        .hp-election-card-turnout { background: #f8fafc; border-radius: 8px; padding: 10px 14px; }
        .hp-election-card-turnout-label { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
        .hp-turnout-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .hp-turnout-fill { height: 100%; background: linear-gradient(90deg, #1a3a6b, #2563eb); border-radius: 3px; }

        /* TESTIMONIALS */
        .hp-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .hp-testimonial { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; position: relative; }
        .hp-testimonial::before { content: '"'; position: absolute; top: 20px; right: 24px; font-size: 80px; color: #f1f5f9; font-family: 'Playfair Display', serif; line-height: 1; }
        .hp-testimonial-text { color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 24px; position: relative; z-index: 1; }
        .hp-testimonial-author { display: flex; align-items: center; gap: 14px; }
        .hp-testimonial-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #1a3a6b, #2563eb); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; flex-shrink: 0; }
        .hp-testimonial-name { font-weight: 700; color: #0f172a; font-size: 15px; }
        .hp-testimonial-role { color: #94a3b8; font-size: 13px; margin-top: 2px; }

        /* CTA */
        .hp-cta {
          background: linear-gradient(135deg, #0f2147 0%, #1a3a6b 50%, #0f2147 100%);
          padding: 100px 40px; text-align: center; position: relative; overflow: hidden;
        }
        .hp-cta-bg { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 50%, rgba(245,158,11,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(37,99,235,0.1) 0%, transparent 50%); }
        .hp-cta-content { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }
        .hp-cta-title { font-size: 52px; font-weight: 900; color: white; margin-bottom: 20px; font-family: 'Playfair Display', serif; }
        .hp-cta-title span { color: #f59e0b; }
        .hp-cta-desc { color: rgba(255,255,255,0.65); font-size: 18px; margin-bottom: 40px; line-height: 1.7; }
        .hp-cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .hp-cta-btn-primary { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 18px 40px; border-radius: 12px; font-weight: 700; font-size: 17px; text-decoration: none; box-shadow: 0 8px 30px rgba(245,158,11,0.3); transition: all 0.3s; }
        .hp-cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(245,158,11,0.5); }
        .hp-cta-btn-secondary { display: inline-flex; align-items: center; gap: 10px; color: white; padding: 18px 40px; border-radius: 12px; font-weight: 600; font-size: 17px; text-decoration: none; border: 2px solid rgba(255,255,255,0.3); transition: all 0.3s; }
        .hp-cta-btn-secondary:hover { background: rgba(255,255,255,0.08); }

        /* FOOTER */
        .hp-footer { background: #050d1f; color: rgba(255,255,255,0.6); padding: 60px 40px 30px; }
        .hp-footer-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 48px; }
        .hp-footer-brand-name { color: white; font-weight: 800; font-size: 22px; margin-bottom: 16px; }
        .hp-footer-brand-desc { font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
        .hp-footer-links-title { color: white; font-weight: 700; font-size: 14px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .hp-footer-link { display: block; color: rgba(255,255,255,0.5); font-size: 14px; text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
        .hp-footer-link:hover { color: #f59e0b; }
        .hp-footer-bottom { max-width: 1200px; margin: 0 auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .hp-footer-badges { display: flex; gap: 12px; }
        .hp-footer-badge { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }

        @media (max-width: 1024px) {
          .hp-hero-title { font-size: 44px; }
          .hp-features-grid, .hp-hiw-grid, .hp-testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .hp-elections-grid { grid-template-columns: repeat(2, 1fr); }
          .hp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hp-footer-grid { grid-template-columns: 1fr 1fr; }
          .hp-hiw-grid::before { display: none; }
          .hp-section-title { font-size: 34px; }
          .hp-cta-title { font-size: 38px; }
        }
        @media (max-width: 768px) {
          .hp-nav { padding: 0 20px; }
          .hp-nav-links { display: none; }
          .hp-hero-content { grid-template-columns: 1fr; gap: 40px; padding: 100px 20px 60px; }
          .hp-hero-title { font-size: 36px; }
          .hp-hero-visual { display: none; }
          .hp-features-grid, .hp-hiw-grid, .hp-testimonials-grid, .hp-elections-grid { grid-template-columns: 1fr; }
          .hp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .hp-section { padding: 60px 20px; }
          .hp-footer-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="hp-nav">
        <a href="/" className="hp-nav-logo">
          <div className="hp-nav-logo-icon">🗳️</div>
          <div className="hp-nav-logo-text">Vote<span>Secure</span> Pro</div>
        </a>
        <div className="hp-nav-links">
          <a href="#features" className="hp-nav-link">Features</a>
          <a href="#how-it-works" className="hp-nav-link">How It Works</a>
          <a href="#elections" className="hp-nav-link">Elections</a>
          <a href="#testimonials" className="hp-nav-link">Testimonials</a>
        </div>
        <div className="hp-nav-actions">
          <Link to="/login" className="hp-btn-ghost">Sign In</Link>
          <Link to="/register" className="hp-btn-cta">Get Started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-hero-bg">
          <div className="hp-hero-grid"></div>
          <div className="hp-hero-glow-1"></div>
          <div className="hp-hero-glow-2"></div>
        </div>
        <div className="hp-hero-content">
          <div>
            <div className="hp-hero-badge">
              <span></span>
              🟢 Live Elections Running Now
            </div>
            <h1 className="hp-hero-title">
              Democracy<br />
              <span>Secured.</span><br />
              Verified. Trusted.
            </h1>
            <p className="hp-hero-desc">
              The world's most advanced online voting platform. Conduct elections at any scale with military-grade security, real-time transparency, and universal accessibility.
            </p>
            <div className="hp-hero-actions">
              <Link to="/register" className="hp-hero-btn-primary">Start Voting Free →</Link>
              <a href="#how-it-works" className="hp-hero-btn-secondary">▶ Watch Demo</a>
            </div>
            <div className="hp-hero-trust">
              <div className="hp-hero-trust-item"><span>✓</span> No credit card required</div>
              <div className="hp-hero-trust-item"><span>✓</span> SOC 2 Type II Certified</div>
              <div className="hp-hero-trust-item"><span>✓</span> ISO 27001 Compliant</div>
            </div>
          </div>
          <div className="hp-hero-visual">
            <div className="hp-hero-card">
              <div className="hp-hero-card-header">
                <span className="hp-hero-card-title">📊 Live Election Monitor</span>
                <span className="hp-live-badge"><span className="hp-live-dot"></span>LIVE</span>
              </div>
              {[
                { name: '2024 Presidential Election', region: 'National', pct: 72 },
                { name: 'State Senate District 4', region: 'California', pct: 45 },
                { name: 'City Mayor Election', region: 'New York', pct: 88 },
              ].map((e, i) => (
                <div className="hp-election-item" key={i}>
                  <div className="hp-election-item-title">{e.name}</div>
                  <div className="hp-election-meta">
                    <span>📍 {e.region}</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{e.pct}% turnout</span>
                  </div>
                  <div className="hp-progress-bar">
                    <div className="hp-progress-fill" style={{ width: `${e.pct}%` }}></div>
                  </div>
                </div>
              ))}
              <div className="hp-vote-counter">
                <span className="hp-vote-counter-label">🗳️ Votes Cast Today</span>
                <span className="hp-vote-counter-value">{stats.votes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="hp-stats">
        <div className="hp-stats-grid">
          {[
            { icon: '🗳️', value: stats.elections.toLocaleString(), suffix: '+', label: 'Elections Conducted' },
            { icon: '👥', value: (stats.voters / 1000000).toFixed(1), suffix: 'M+', label: 'Registered Voters' },
            { icon: '✅', value: (stats.votes / 1000000).toFixed(1), suffix: 'M+', label: 'Votes Cast Securely' },
            { icon: '🌍', value: stats.countries.toString(), suffix: '+', label: 'Countries Served' },
          ].map((s, i) => (
            <div className="hp-stat" key={i}>
              <div className="hp-stat-icon">{s.icon}</div>
              <div className="hp-stat-value">{s.value}<span>{s.suffix}</span></div>
              <div className="hp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="hp-section" id="features">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <div className="hp-section-label">🛡️ Platform Features</div>
            <h2 className="hp-section-title">Everything you need for<br /><span>secure, fair elections</span></h2>
            <p className="hp-section-desc">Built with election integrity at its core, our platform provides every tool needed to run transparent, tamper-proof elections.</p>
          </div>
          <div className="hp-features-grid">
            {features.map((f, i) => (
              <div className="hp-feature-card" key={i}>
                <div className="hp-feature-icon">{f.icon}</div>
                <div className="hp-feature-title">{f.title}</div>
                <div className="hp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hp-section hp-hiw" id="how-it-works">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <div className="hp-section-label">⚡ Simple Process</div>
            <h2 className="hp-section-title">Voting made <span>simple</span></h2>
            <p className="hp-section-desc">From registration to verified results, our streamlined process ensures every vote counts.</p>
          </div>
          <div className="hp-hiw-grid">
            {howItWorks.map((h, i) => (
              <div className="hp-hiw-item" key={i}>
                <div className="hp-hiw-step">{h.step}</div>
                <div className="hp-hiw-title">{h.title}</div>
                <div className="hp-hiw-desc">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ELECTIONS */}
      <section className="hp-section" id="elections">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <div className="hp-section-label">🗳️ Live Elections</div>
            <h2 className="hp-section-title">Current & <span>Upcoming Elections</span></h2>
            <p className="hp-section-desc">Browse active, upcoming, and recently completed elections from around the world.</p>
          </div>
          <div className="hp-elections-tabs">
            {['active', 'upcoming', 'completed', 'all'].map(tab => (
              <button key={tab} className={`hp-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {filteredElections.length > 0 ? (
            <div className="hp-elections-grid">
              {filteredElections.map((e, i) => {
                const emojis = { general: '🏛️', primary: '🌟', local: '🏘️', referendum: '📋', special: '⭐' };
                const bgs = ['#dbeafe', '#fce7f3', '#d1fae5', '#fef3c7', '#e0e7ff'];
                const turnout = e.totalEligibleVoters > 0 ? Math.round((e.totalVotesCast / e.totalEligibleVoters) * 100) : 0;
                return (
                  <div className="hp-election-card" key={e._id || i}>
                    <div className="hp-election-card-img" style={{ background: bgs[i % bgs.length] }}>
                      <div className="hp-election-card-img-bg">{emojis[e.type] || '🗳️'}</div>
                      <span className={`hp-election-card-status ${e.status}`}>{e.status.toUpperCase()}</span>
                    </div>
                    <div className="hp-election-card-body">
                      <div className="hp-election-card-type">{e.type} election · {e.region}</div>
                      <div className="hp-election-card-title">{e.title}</div>
                      <div className="hp-election-card-meta">
                        <span>📅 {new Date(e.startDate).toLocaleDateString()}</span>
                        <span>👥 {e.totalEligibleVoters?.toLocaleString()} eligible</span>
                      </div>
                      <div className="hp-election-card-turnout">
                        <div className="hp-election-card-turnout-label">Voter Turnout: {turnout}%</div>
                        <div className="hp-turnout-bar"><div className="hp-turnout-fill" style={{ width: `${turnout}%` }}></div></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗳️</div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>No {activeTab} elections at this time</p>
              <p style={{ marginTop: '8px' }}>Check back soon or register to be notified.</p>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="hp-section" id="testimonials" style={{ background: '#f8fafc' }}>
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <div className="hp-section-label">💬 Trusted Globally</div>
            <h2 className="hp-section-title">What election officials <span>say about us</span></h2>
          </div>
          <div className="hp-testimonials-grid">
            {testimonials.map((t, i) => (
              <div className="hp-testimonial" key={i}>
                <p className="hp-testimonial-text">{t.text}</p>
                <div className="hp-testimonial-author">
                  <div className="hp-testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="hp-testimonial-name">{t.name}</div>
                    <div className="hp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <div className="hp-cta-bg"></div>
        <div className="hp-cta-content">
          <h2 className="hp-cta-title">Ready to run your<br /><span>next election?</span></h2>
          <p className="hp-cta-desc">Join thousands of organizations that trust VoteSecure Pro to conduct fair, transparent, and secure elections.</p>
          <div className="hp-cta-actions">
            <Link to="/register" className="hp-cta-btn-primary">🗳️ Start Free Today</Link>
            <Link to="/login" className="hp-cta-btn-secondary">Sign In →</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <div className="hp-footer-grid">
          <div>
            <div className="hp-footer-brand-name">🗳️ VoteSecure Pro</div>
            <div className="hp-footer-brand-desc">The world's most trusted online voting platform. Secure, transparent, and accessible elections for organizations of all sizes.</div>
            <div className="hp-footer-badges">
              <span className="hp-footer-badge">🔒 SOC 2</span>
              <span className="hp-footer-badge">✓ ISO 27001</span>
              <span className="hp-footer-badge">🛡️ GDPR</span>
            </div>
          </div>
          <div>
            <div className="hp-footer-links-title">Platform</div>
            <a href="#features" className="hp-footer-link">Features</a>
            <a href="#how-it-works" className="hp-footer-link">How It Works</a>
            <a href="#elections" className="hp-footer-link">Elections</a>
            <a className="hp-footer-link" href="#!">Pricing</a>
            <a className="hp-footer-link" href="#!">API Docs</a>
          </div>
          <div>
            <div className="hp-footer-links-title">Company</div>
            <a className="hp-footer-link" href="#!">About Us</a>
            <a className="hp-footer-link" href="#!">Blog</a>
            <a className="hp-footer-link" href="#!">Careers</a>
            <a className="hp-footer-link" href="#!">Press Kit</a>
            <a className="hp-footer-link" href="#!">Contact</a>
          </div>
          <div>
            <div className="hp-footer-links-title">Legal</div>
            <a className="hp-footer-link" href="#!">Privacy Policy</a>
            <a className="hp-footer-link" href="#!">Terms of Service</a>
            <a className="hp-footer-link" href="#!">Security Policy</a>
            <a className="hp-footer-link" href="#!">Cookie Policy</a>
          </div>
        </div>
        <div className="hp-footer-bottom">
          <span>© 2024 VoteSecure Pro. All rights reserved.</span>
          <span>Built with ❤️ for democracy</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
