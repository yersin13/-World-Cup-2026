import React, { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { flag, matchId } from '../data/matches'

function NickScreen({ onSave }) {
  const [val, setVal] = useState('')
  return (
    <div className="page">
      <div className="nick-screen">
        <div className="nick-card">
          <div style={{ fontSize:48, marginBottom:12 }}>👤</div>
          <h2>Who are you?</h2>
          <p>Pick a nickname — this is how you'll appear on the leaderboard.</p>
          <input
            className="nick-input"
            placeholder="e.g. Diego, El Charro, Messi Fan…"
            value={val}
            maxLength={20}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && val.trim() && onSave(val.trim())}
            autoFocus
          />
          <button
            className="btn btn-primary"
            style={{ width:'100%', justifyContent:'center' }}
            disabled={!val.trim()}
            onClick={() => onSave(val.trim())}
          >
            Let's go →
          </button>
        </div>
      </div>
    </div>
  )
}

function ScoreInput({ value, onChange, label, flagEmoji }) {
  return (
    <div className="score-team-block">
      <div className="score-team-label">
        <span>{flagEmoji}</span> {label}
      </div>
      <div className="score-input-wrap">
        <button
          className="score-btn"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label="decrease"
        >−</button>
        <div className="score-display">{value}</div>
        <button
          className="score-btn"
          onClick={() => onChange(Math.min(20, value + 1))}
          aria-label="increase"
        >+</button>
      </div>
    </div>
  )
}

function WagerFormCard({ match, existingWager, onSubmit, saving }) {
  const id = matchId(match)
  const [g1, setG1] = useState(existingWager?.goals1 ?? 1)
  const [g2, setG2] = useState(existingWager?.goals2 ?? 1)
  const [comment, setComment] = useState(existingWager?.comment ?? '')

  const prediction = g1 > g2 ? match.team1 : g2 > g1 ? match.team2 : 'Draw'
  const predClass  = g1 > g2 ? 'pred-home' : g2 > g1 ? 'pred-away' : 'pred-draw'

  return (
    <div className="wager-form-card">
      <div className="wager-match-header">
        <div className="wager-teams">
          <span>{flag(match.team1)}</span>
          <span>{match.team1}</span>
          <span style={{ color:'var(--slate)', fontWeight:400, fontSize:13 }}>vs</span>
          <span>{match.team2}</span>
          <span>{flag(match.team2)}</span>
        </div>
        <div className="wager-meta">
          {match.group && <div>{match.group}</div>}
          <div>{match.date} · {match.ground}</div>
          {existingWager && (
            <div style={{ color:'var(--gold)', fontSize:11, marginTop:3 }}>✏️ Editing wager</div>
          )}
        </div>
      </div>

      <div className="wager-body">
        <div className="score-input-row">
          <ScoreInput value={g1} onChange={setG1} label={match.team1} flagEmoji={flag(match.team1)} />
          <div className="score-vs-divider">
            <span>–</span>
            <div className={`predicted-result ${predClass}`}>
              {g1 > g2 ? `${match.team1} wins` : g2 > g1 ? `${match.team2} wins` : 'Draw'}
            </div>
          </div>
          <ScoreInput value={g2} onChange={setG2} label={match.team2} flagEmoji={flag(match.team2)} />
        </div>

        <div className="wager-comment">
          <label>Your trash talk (optional)</label>
          <input
            placeholder="e.g. Brazil is gonna crush this…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={120}
          />
        </div>

        <div className="wager-actions">
          <div style={{ fontSize:12, color:'var(--slate)' }}>
            +3 pts exact score · +1 pt correct result
          </div>
          <button
            className="btn btn-primary"
            onClick={() => onSubmit(id, g1, g2, comment)}
            disabled={saving}
          >
            {saving ? 'Saving…' : existingWager ? '✓ Update wager' : '⚡ Lock it in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WagerPage() {
  const { matches, binData, nickname, saveNickname, placeWager, saving } = useApp()
  const [submitted, setSubmitted] = useState({})
  const [tab, setTab] = useState('open') // 'open' | 'done'

  if (!nickname) return <NickScreen onSave={saveNickname} />

  const myWagers = binData.wagers?.[nickname] || {}

  const upcomingMatches = matches.filter(m => !m.score?.ft)
  const doneMatches     = matches.filter(m => m.score?.ft)

  const shown = tab === 'open' ? upcomingMatches : doneMatches

  const handleSubmit = async (id, g1, g2, comment) => {
    await placeWager(id, g1, g2, comment)
    setSubmitted(p => ({ ...p, [id]: true }))
    setTimeout(() => setSubmitted(p => { const n={...p}; delete n[id]; return n }), 2000)
  }

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <div className="section-title">Place Wagers</div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { localStorage.removeItem('wc_nick'); window.location.reload() }}
        >
          👤 {nickname} ↩
        </button>
      </div>
      <div className="section-sub">Predict the exact score for each match. 3 pts for exact · 1 pt for correct result.</div>

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button className={`btn btn-sm ${tab==='open'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('open')}>
          Upcoming ({upcomingMatches.length})
        </button>
        <button className={`btn btn-sm ${tab==='done'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('done')}>
          Played ({doneMatches.length})
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">{tab==='open'?'🏁':'⏳'}</div>
          {tab==='open' ? 'No upcoming matches right now.' : 'No matches played yet.'}
        </div>
      ) : (
        shown.map(m => {
          const id = matchId(m)
          const locked = tab === 'done'
          if (locked) {
            const w = myWagers[id]
            return (
              <div className="match-card" key={id} style={{ marginBottom:10, padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ flex:1, fontWeight:700 }}>
                    {flag(m.team1)} {m.team1} {m.score.ft[0]} – {m.score.ft[1]} {m.team2} {flag(m.team2)}
                  </div>
                  {w ? (
                    <div style={{ fontSize:12, color:'var(--slate)' }}>
                      Your pick: <strong style={{ color:'var(--white)' }}>{w.goals1}–{w.goals2}</strong>
                    </div>
                  ) : (
                    <div style={{ fontSize:12, color:'var(--slate)' }}>No wager placed</div>
                  )}
                </div>
              </div>
            )
          }
          return (
            <div key={id} style={{ position:'relative' }}>
              {submitted[id] && (
                <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0,
                  background:'rgba(0,135,90,0.15)', borderRadius:'var(--r-lg)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:18, fontWeight:700, color:'var(--green)', zIndex:10,
                  border:'1px solid rgba(0,135,90,0.4)' }}>
                  ✓ Wager saved!
                </div>
              )}
              <WagerFormCard
                match={m}
                existingWager={myWagers[id]}
                onSubmit={handleSubmit}
                saving={saving}
              />
            </div>
          )
        })
      )}
    </div>
  )
}
