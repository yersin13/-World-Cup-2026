import React, { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { matchId, scoreWager, avatarColor, initials } from '../data/matches'

export default function LeaderboardPage() {
  const { matches, binData } = useApp()
  const [showAll, setShowAll] = useState(false)

  const scores = {}
  for (const [nick, wagers] of Object.entries(binData.wagers || {})) {
    let pts=0, exact=0, correct=0, wrong=0, pending=0, total=0
    for (const [id, w] of Object.entries(wagers)) {
      const m = matches.find(x => matchId(x) === id)
      const p = m ? scoreWager(w, m.score) : null
      total++
      if      (p === null) pending++
      else if (p === 3)    { pts+=3; exact++ }
      else if (p === 1)    { pts+=1; correct++ }
      else                  wrong++
    }
    const played = total - pending
    scores[nick] = { pts, exact, correct, wrong, pending, total, played,
      accuracy: played > 0 ? Math.round((exact+correct)/played*100) : 0 }
  }

  const sorted = Object.entries(scores).sort((a,b) =>
    b[1].pts - a[1].pts || b[1].exact - a[1].exact || a[1].wrong - b[1].wrong
  )

  const maxPts = sorted[0]?.[1]?.pts || 1
  const shown  = showAll ? sorted : sorted.slice(0, 10)

  if (!sorted.length) {
    return (
      <div className="page">
        <div className="section-title">Leaderboard</div>
        <div className="empty" style={{ marginTop:32 }}>
          <div className="empty-icon">🏆</div>
          No wagers placed yet. Be the first!
        </div>
      </div>
    )
  }

  const podium = sorted.slice(0, 3)
  const rankClass = i => i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':''
  const medalEmoji = i => i===0?'🥇':i===1?'🥈':i===2?'🥉':''

  return (
    <div className="page">
      <div className="section-title">Leaderboard</div>
      <div className="section-sub">Ranked by points · 3 pts exact score · 1 pt correct result</div>

      {/* Podium */}
      {podium.length >= 2 && (
        <div style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:28, alignItems:'flex-end' }}>
          {[podium[1], podium[0], podium[2]].filter(Boolean).map(([nick, s], vi) => {
            const realIdx = vi===0?1:vi===1?0:2
            const heights = [80, 110, 60]
            return (
              <div key={nick} style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{medalEmoji(realIdx)}</div>
                <div className="lb-avatar" style={{
                  background: avatarColor(nick),
                  width:48, height:48, fontSize:16,
                  marginBottom:8, border: realIdx===0 ? '2px solid var(--gold)' : '2px solid transparent'
                }}>
                  {initials(nick)}
                </div>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{nick}</div>
                <div style={{
                  background:'var(--navy-3)', border:'1px solid var(--border)',
                  borderRadius:'var(--r-sm) var(--r-sm) 0 0',
                  width:80, height:heights[vi],
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'flex-start',
                  paddingTop:10,
                }}>
                  <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:28, color:'var(--gold)', lineHeight:1 }}>{s.pts}</div>
                  <div style={{ fontSize:10, color:'var(--slate)' }}>pts</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="lb-table" style={{ width:'100%' }}>
          <thead>
            <tr>
              <th style={{ width:40 }}>#</th>
              <th>Player</th>
              <th style={{ textAlign:'center' }}>Pts</th>
              <th style={{ textAlign:'center' }}>🎯 Exact</th>
              <th style={{ textAlign:'center' }}>✓ Result</th>
              <th style={{ textAlign:'center' }}>Acc %</th>
              <th style={{ minWidth:100 }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(([nick, s], i) => (
              <tr key={nick}>
                <td>
                  <span className={`lb-rank ${rankClass(i)}`}>{i+1}</span>
                </td>
                <td>
                  <div className="lb-player">
                    <div className="lb-avatar" style={{ background:avatarColor(nick), width:34, height:34, fontSize:13 }}>
                      {initials(nick)}
                    </div>
                    <span className="lb-name">{nick}</span>
                  </div>
                </td>
                <td style={{ textAlign:'center' }}>
                  <span className="lb-pts">{s.pts}</span>
                </td>
                <td style={{ textAlign:'center', color:'var(--gold)', fontWeight:700 }}>{s.exact}</td>
                <td style={{ textAlign:'center', color:'#5DCAA5', fontWeight:700 }}>{s.correct}</td>
                <td style={{ textAlign:'center', color:'var(--slate)' }}>{s.accuracy}%</td>
                <td>
                  <div className="lb-bar-wrap">
                    <div className="lb-bar" style={{ width: `${Math.round(s.pts/maxPts*100)}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length > 10 && (
          <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAll(p=>!p)}>
              {showAll ? 'Show less ↑' : `Show all ${sorted.length} players ↓`}
            </button>
          </div>
        )}
      </div>

      {/* All wagers breakdown */}
      <div style={{ marginTop:24 }}>
        <div className="card-title" style={{ marginBottom:14 }}>🔍 All predictions</div>
        <div className="all-wagers-grid">
          {sorted.map(([nick, s]) => {
            const wagers = binData.wagers?.[nick] || {}
            return (
              <div className="user-wager-card" key={nick}>
                <div className="user-wager-header">
                  <div className="lb-avatar" style={{ background:avatarColor(nick), width:32, height:32, fontSize:12 }}>
                    {initials(nick)}
                  </div>
                  <span style={{ fontWeight:700 }}>{nick}</span>
                  <span style={{ marginLeft:'auto', fontFamily:'Bebas Neue, sans-serif', fontSize:20, color:'var(--gold)' }}>
                    {s.pts} pts
                  </span>
                </div>
                <div style={{ padding:'10px 16px' }}>
                  {Object.entries(wagers).map(([id, w]) => {
                    const m = matches.find(x => matchId(x) === id)
                    const pts = m ? scoreWager(w, m.score) : null
                    const icon = pts===3?'🎯':pts===1?'✓':pts===0?'✗':'⏳'
                    const clr  = pts===3?'var(--gold)':pts===1?'#5DCAA5':pts===0?'var(--red)':'var(--slate)'
                    return (
                      <div key={id} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0',
                        borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:12 }}>
                        <span style={{ color:clr, width:16, flexShrink:0 }}>{icon}</span>
                        <span style={{ flex:1, color:'var(--slate)' }}>
                          {m?.team1||id} vs {m?.team2||''}
                        </span>
                        <span style={{ fontWeight:700 }}>{w.goals1}–{w.goals2}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
