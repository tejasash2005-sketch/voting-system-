import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { voterNav } from '../../utils/navConfig';
import { voterAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function VoterElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    voterAPI.getElections()
      .then(r => setElections(r.data.elections || []))
      .catch(() => toast.error('Failed to load elections'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = elections.filter(e => filter === 'all' || e.status === filter);
  const typeEmojis = { general: '🏛️', primary: '⭐', local: '🏘️', referendum: '📋', special: '🌟' };

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header">
        <div><h1 className="page-title">Elections</h1><p className="page-subtitle">Browse and participate in elections</p></div>
        <Link to="/voter/search" className="btn btn-outline btn-sm">🔍 Search Elections</Link>
      </div>

      <div className="page-content fade-in">
        {/* Filter Tabs */}
        <div className="tabs">
          {[['active', '🔴 Active'], ['upcoming', '📅 Upcoming'], ['completed', '✅ Completed'], ['all', '📋 All']].map(([val, label]) => (
            <button key={val} className={`tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#059669' }}></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card" style={{ padding: 60 }}>
            <div className="empty-state-icon">🗳️</div>
            <h3>No {filter} elections</h3>
            <p>Check back soon for upcoming elections.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {filtered.map(e => {
              const turnout = e.totalEligibleVoters > 0 ? ((e.totalVotesCast / e.totalEligibleVoters) * 100).toFixed(1) : 0;
              const allPositions = e.positions?.length || 0;
              const voted = e.positionsVoted?.length || 0;
              const canVote = e.status === 'active' && voted < allPositions;

              return (
                <div key={e._id} className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={el => { el.currentTarget.style.transform = 'translateY(-4px)'; el.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={el => { el.currentTarget.style.transform = 'none'; el.currentTarget.style.boxShadow = ''; }}>
                  {/* Header */}
                  <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 32 }}>{typeEmojis[e.type] || '🗳️'}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1 }}>{e.type}</div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 2, lineHeight: 1.3 }}>{e.title}</h3>
                      </div>
                    </div>
                    <span className={`badge badge-${e.status}`}>{e.status}</span>
                  </div>

                  <div style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                      <span>📍 {e.region}</span>
                      <span>📅 {new Date(e.endDate).toLocaleDateString()}</span>
                    </div>

                    {/* Positions */}
                    {allPositions > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>POSITIONS ({allPositions})</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {e.positions?.map((pos, i) => {
                            const hasVoted = e.positionsVoted?.includes(pos.name);
                            return (
                              <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: hasVoted ? '#d1fae5' : '#f1f5f9', color: hasVoted ? '#065f46' : '#64748b', fontWeight: 600 }}>
                                {hasVoted ? '✅' : '○'} {pos.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Turnout */}
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: '#94a3b8' }}>Voter Turnout</span>
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>{turnout}%</span>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${Math.min(turnout, 100)}%`, background: 'linear-gradient(90deg, #059669, #10b981)' }}></div>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{e.totalVotesCast?.toLocaleString()} of {e.totalEligibleVoters?.toLocaleString()} votes cast</div>
                    </div>

                    {/* Voting progress for voter */}
                    {e.status === 'active' && allPositions > 0 && (
                      <div style={{ background: voted === allPositions ? '#d1fae5' : '#fef3c7', borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 13 }}>
                        {voted === allPositions
                          ? <span style={{ color: '#065f46', fontWeight: 600 }}>✅ You've voted in all {allPositions} position(s)</span>
                          : <span style={{ color: '#92400e', fontWeight: 600 }}>⏳ Voted {voted}/{allPositions} positions</span>}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      {e.status === 'active' && canVote && (
                        <Link to={`/voter/vote/${e._id}`} className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }}>🗳️ Vote Now</Link>
                      )}
                      {e.status === 'active' && !canVote && voted === allPositions && (
                        <Link to={`/voter/results/${e._id}`} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>📊 Live Results</Link>
                      )}
                      {e.status === 'completed' && (
                        <Link to={`/voter/results/${e._id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>📊 View Results</Link>
                      )}
                      {e.status === 'upcoming' && (
                        <button className="btn btn-outline" style={{ flex: 1 }} disabled>📅 Opens {new Date(e.startDate).toLocaleDateString()}</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
