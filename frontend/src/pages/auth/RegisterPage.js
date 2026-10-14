import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', nationalId: '', role: 'voter', dateOfBirth: '', address: { city: '', state: '', country: '' } });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created successfully!');
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white', transition: 'border-color 0.2s' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🗳️</div>
              <span style={{ color: '#0f172a', fontWeight: 800, fontSize: 20 }}>VoteSecure Pro</span>
            </Link>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Create your account</h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>Join millions of voters on the most secure platform</p>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 4, borderRadius: 2, background: s <= step ? '#2563eb' : '#e2e8f0', marginBottom: 6, transition: 'background 0.3s' }}></div>
                <span style={{ fontSize: 12, color: s <= step ? '#2563eb' : '#94a3b8', fontWeight: 600 }}>
                  {['Personal Info', 'Identity', 'Account'][s - 1]}
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Personal Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input style={inputStyle} value={form.firstName} onChange={e => update('firstName', e.target.value)} required placeholder="John" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input style={inputStyle} value={form.lastName} onChange={e => update('lastName', e.target.value)} required placeholder="Doe" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Email Address *</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="john@example.com" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1-555-0100" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Date of Birth</label>
                    <input style={inputStyle} type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <button type="button" onClick={() => setStep(2)}
                    style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Continue →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Identity Verification</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>National ID Number</label>
                    <input style={inputStyle} value={form.nationalId} onChange={e => update('nationalId', e.target.value)} placeholder="ID123456789" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>City</label>
                      <input style={inputStyle} value={form.address.city} onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} placeholder="New York" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div>
                      <label style={labelStyle}>State / Province</label>
                      <input style={inputStyle} value={form.address.state} onChange={e => setForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))} placeholder="NY" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Country</label>
                    <input style={inputStyle} value={form.address.country} onChange={e => setForm(f => ({ ...f, address: { ...f.address, country: e.target.value } }))} placeholder="United States" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Register As</label>
                    <select style={{ ...inputStyle, appearance: 'none' }} value={form.role} onChange={e => update('role', e.target.value)}>
                      <option value="voter">🗳️ Voter</option>
                      <option value="observer">👁️ Observer</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setStep(1)}
                      style={{ flex: 1, padding: 13, background: 'white', color: '#475569', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button type="button" onClick={() => setStep(3)}
                      style={{ flex: 2, padding: 13, background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Set Your Password</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Password *</label>
                    <input style={inputStyle} type="password" value={form.password} onChange={e => update('password', e.target.value)} required placeholder="Min. 6 characters" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Confirm Password *</label>
                    <input style={inputStyle} type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required placeholder="Re-enter password"
                      style={{ ...inputStyle, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : '#e2e8f0' }}
                      onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>Passwords do not match</p>
                    )}
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                    <p style={{ fontSize: 13, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>✅ Account Summary</p>
                    <p style={{ fontSize: 13, color: '#065f46' }}>Name: {form.firstName} {form.lastName}</p>
                    <p style={{ fontSize: 13, color: '#065f46' }}>Email: {form.email}</p>
                    <p style={{ fontSize: 13, color: '#065f46' }}>Role: {form.role}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setStep(2)}
                      style={{ flex: 1, padding: 13, background: 'white', color: '#475569', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button type="submit" disabled={loading}
                      style={{ flex: 2, padding: 13, background: loading ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? '⏳ Creating...' : '🎉 Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 }}>
            Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
