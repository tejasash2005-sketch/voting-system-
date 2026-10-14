import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { voterNav } from '../../utils/navConfig';
import { voterAPI, voteAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function VotingBooth() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [ballot, setBallot] = useState([]);
  const [positionsVoted, setPositionsVoted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [abstain, setAbstain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState('ballot'); // ballot | confirm | success

  useEffect(() => {
    voterAPI.getBallot(electionId)
      .then(r => {
        setElection(r.data.election);
        setBallot(r.data.ballot || []);
        setPositionsVoted(r.data.positionsVoted || []);
        // Find first unvoted position
        const firstUnvoted = r.data.ballot?.findIndex(p => !r.data.positionsVoted.includes(p.position));
        setCurrentPosition(firstUnvoted >= 0 ? firstUnvoted : 0);
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load ballot');
        navigate('/voter/elections');
      })
      .finally(() => setLoading(false));
  }, [electionId]);

  const currentPos = ballot[currentPosition];
  const hasVotedCurrent = positionsVoted.includes(currentPos?.position);

  const handleVote = () => {
    if (!selectedCandidate && !abstain) {
      toast.error('Please select a candidate or choose to abstain');
      return;
    }
    setShowConfirm(true);
    setStep('confirm');
  };

  const confirmVote = async () => {
    setSubmitting(true);
    try {
      const payload = { electionId, position: currentPos.position, isAbstain: abstain, candidateId: abstain ? null : selectedCandidate };
      const r = await voteAPI.cast(payload);
      setReceipt(r.data.receipt);
      setPositionsVoted(prev => [...prev, currentPos.position]);
      setStep('success');
      toast.success('Vote cast successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
      setStep('ballot');
    } finally {
      setSubmitting(false);
    }
  };

  const nextPosition = () => {
    setSelectedCandidate(null);
    setAbstain(false);
    setStep('ballot');
    setShowConfirm(false);
    const next = ballot.findIndex((p, i) => i > currentPosition && !positionsVoted.includes(p.position));
    if (next >= 0) setCurrentPosition(next);
    else navigate('/voter/history');
  };

  const allVoted = ballot.length > 0 && ballot.every(p => positionsVoted.includes(p.position));

  if (loading) return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#059669' }}></div><p style={{ color: '#64748b' }}>Loading ballot...</p></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header">
        <div>
          <h1 className="page-title">🗳️ Voting Booth</h1>
          <p className="page-subtitle">{election?.title}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#d1fae5', padding: '8px 16px', borderRadius: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>SECURE VOTING SESSION</span>
        </div>
      </div>

      <div className="page-content fade-in">
        {/* Progress */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Voting Progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#2563eb' }}>{positionsVoted.length}/{ballot.length} positions</span>
            </div>
            <div className="progress" style={{ height: 10 }}>
              <div className="progress-bar" style={{ width: `${ballot.length > 0 ? (positionsVoted.length / ballot.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #059669, #10b981)' }}></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {ballot.map((p, i) => (
                <span key={i} onClick={() => { if (!positionsVoted.includes(p.position)) { setCurrentPosition(i); setSelectedCandidate(null); setAbstain(false); setStep('ballot'); } }}
                  style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: positionsVoted.includes(p.position) ? 'default' : 'pointer', background: positionsVoted.includes(p.position) ? '#d1fae5' : i === currentPosition ? '#dbeafe' : '#f1f5f9', color: positionsVoted.includes(p.position) ? '#065f46' : i === currentPosition ? '#1e40af' : '#64748b', border: i === currentPosition ? '2px solid #3b82f6' : '2px solid transparent' }}>
                  {positionsVoted.includes(p.position) ? '✅' : '○'} {p.position}
                </span>
              ))}
            </div>
          </div>
        </div>

        {allVoted ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>You've voted in all positions!</h2>
            <p style={{ color: '#64748b', fontSize: 16, marginBottom: 28 }}>Thank you for participating in this election. Your votes have been securely recorded.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/voter/history')}>📜 View Vote History</button>
              <button className="btn btn-outline" onClick={() => navigate('/voter/receipt')}>🧾 Verify Receipt</button>
            </div>
          </div>
        ) : step === 'success' ? (
          <div className="card" style={{ padding: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Vote Cast Successfully!</h2>
              <p style={{ color: '#64748b' }}>Your vote for <strong>{currentPos?.position}</strong> has been recorded.</p>
            </div>
            {receipt && (
              <div style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🧾 Vote Receipt</h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[['Receipt Code', receipt.receiptCode], ['Vote Hash', receipt.voteHash?.slice(0, 32) + '...'], ['Timestamp', new Date(receipt.timestamp).toLocaleString()]].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#0f172a', fontWeight: 600, wordBreak: 'break-all', textAlign: 'right' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: 10, background: '#fef3c7', borderRadius: 8, fontSize: 12, color: '#92400e' }}>
                  💡 Save your receipt code to verify your vote later at <strong>/voter/receipt</strong>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {ballot.some((p, i) => i > currentPosition && !positionsVoted.includes(p.position)) && (
                <button className="btn btn-primary" onClick={nextPosition}>Next Position →</button>
              )}
              <button className="btn btn-outline" onClick={() => navigate('/voter/elections')}>Back to Elections</button>
            </div>
          </div>
        ) : step === 'confirm' ? (
          <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Confirm Your Vote</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Once submitted, your vote cannot be changed.</p>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>POSITION</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>{currentPos?.position}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>YOUR CHOICE</div>
              {abstain ? (
                <div style={{ fontWeight: 700, fontSize: 16, color: '#64748b' }}>⬛ Abstain</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {(() => { const c = currentPos?.candidates?.find(c => c._id === selectedCandidate); return c ? (
                    <>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.partyColor || '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{c.firstName?.[0]}{c.lastName?.[0]}</div>
                      <div><div style={{ fontWeight: 700, fontSize: 16 }}>{c.firstName} {c.lastName}</div><div style={{ fontSize: 13, color: '#94a3b8' }}>{c.party}</div></div>
                    </>
                  ) : null; })()}
                </div>
              )}
            </div>
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>⚠️ This action is <strong>irreversible</strong>. Your vote is encrypted and anonymous.</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setStep('ballot')} style={{ flex: 1 }}>← Change Vote</button>
              <button className="btn btn-success" onClick={confirmVote} disabled={submitting} style={{ flex: 1 }}>
                {submitting ? '⏳ Submitting...' : '✅ Confirm Vote'}
              </button>
            </div>
          </div>
        ) : (
          /* Ballot */
          currentPos && !hasVotedCurrent && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>🏛️ {currentPos.position}</h2>
                {currentPos.description && <p style={{ color: '#64748b', fontSize: 14 }}>{currentPos.description}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                {currentPos.candidates?.map(c => (
                  <div key={c._id} onClick={() => { setSelectedCandidate(c._id); setAbstain(false); }}
                    style={{ border: `3px solid ${selectedCandidate === c._id ? (c.partyColor || '#2563eb') : '#e2e8f0'}`, borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.2s', background: selectedCandidate === c._id ? `${c.partyColor || '#2563eb'}08` : 'white', position: 'relative', boxShadow: selectedCandidate === c._id ? `0 0 0 1px ${c.partyColor || '#2563eb'}` : 'none' }}>
                    {selectedCandidate === c._id && (
                      <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: '50%', background: c.partyColor || '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>✓</div>
                    )}
                    {c.isIncumbent && <div style={{ position: 'absolute', top: 12, left: 12, background: '#fef3c7', color: '#92400e', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>INCUMBENT</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, marginTop: c.isIncumbent ? 8 : 0 }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: c.partyColor || '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
                        {c.firstName?.[0]}{c.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>#{c.ballotNumber} {c.firstName} {c.lastName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.partyColor || '#1a3a6b' }}></div>
                          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{c.party || 'Independent'}</span>
                        </div>
                      </div>
                    </div>
                    {c.bio && <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 10 }}>{c.bio.slice(0, 100)}{c.bio.length > 100 ? '...' : ''}</p>}
                    {c.age && <div style={{ fontSize: 12, color: '#94a3b8' }}>Age {c.age}</div>}
                  </div>
                ))}
                {election?.allowAbstain && (
                  <div onClick={() => { setAbstain(true); setSelectedCandidate(null); }}
                    style={{ border: `3px solid ${abstain ? '#6b7280' : '#e2e8f0'}`, borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.2s', background: abstain ? '#f8fafc' : 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>⬛</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Abstain</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>Choose not to vote for this position</div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button className="btn btn-outline" onClick={() => navigate('/voter/elections')}>Cancel</button>
                <button className="btn btn-success btn-lg" onClick={handleVote} disabled={!selectedCandidate && !abstain}>
                  🗳️ Cast Vote for {currentPos.position}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
