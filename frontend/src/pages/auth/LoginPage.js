import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    { role: 'superadmin', email: 'superadmin@votesecure.com', color: '#9d174d', icon: '👑' },
    { role: 'admin', email: 'admin@votesecure.com', color: '#1e40af', icon: '⚙️' },
    { role: 'voter', email: 'voter1@votesecure.com', color: '#065f46', icon: '🗳️' },
    { role: 'observer', email: 'observer@votesecure.com', color: '#3730a3', icon: '👁️' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (account) => {
    setForm({ email: account.email, password: 'Password123!' });
    setLoading(true);
    try {
      const data = await login(account.email, 'Password123!');
      toast.success(`Logged in as ${data.user.role}!`);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.error('Quick login failed. Make sure the database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Left Panel */}
      <div style={{
        width: '45%', background: 'linear-gradient(160deg, #050d1f 0%, #0a1628 40%, #1a3a6b 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(245,158,11,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(37,99,235,0.15) 0%, transparent 50%)' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 60 }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🗳️</div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 22 }}>VoteSecure <span style={{ color: '#f59e0b' }}>Pro</span></span>
          </Link>
          <h1 style={{ color: 'white', fontSize: 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, fontFamily: 'Playfair Display, serif' }}>
            Secure.<br /><span style={{ color: '#f59e0b' }}>Transparent.</span><br />Democratic.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
            Access the world's most trusted online voting platform. Your vote is protected by military-grade encryption.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '🔒', text: 'End-to-end encrypted ballots' },
              { icon: '✅', text: 'Tamper-proof vote receipts' },
              { icon: '📊', text: 'Real-time transparent results' },
              { icon: '🌍', text: 'Trusted in 42+ countries' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#f8fafc', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>Sign in to your VoteSecure account</p>

          {/* Demo Quick Login */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ Quick Demo Login</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {demoAccounts.map(acc => (
                <button key={acc.role} onClick={() => quickLogin(acc)} disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: `2px solid ${acc.color}20`, background: `${acc.color}08`, cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 600, color: acc.color }}>
                  <span>{acc.icon}</span>
                  <span style={{ textTransform: 'capitalize' }}>{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}></div>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>or sign in manually</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', background: 'white' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Password</label>
                <a href="#!" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 48px 12px 16px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 15, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', background: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a3a6b, #2563eb)', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
              {loading ? '⏳ Signing in...' : '🔐 Sign In Securely'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, color: '#64748b', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Create one free →</Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 12 }}>
            🔒 Protected by 256-bit SSL encryption · SOC 2 Certified
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
