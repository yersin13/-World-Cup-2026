import React from 'react'
import { useApp } from '../hooks/useApp'
import { flag, matchId, scoreWager } from '../data/matches'

export default function MyWagersPage() {
  const { matches, binData, nickname, deleteWager, saving } = useApp()

  if (!nickname) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty-icon">👤</div>
          Set your nickname in the Wager tab first.
        </div>
      </div>
    )
  }

  const myWagers = binData.wagers?.[nickname] || {}
  const entries  = Object.entries(myWagers)

  if (!entries.length) {
    return (
      <div className="page">
        <div className="section-title">My Wagers</div>
        <div className="empty" style={{ marginTop:32 }}>
          <div className="empty-icon">🎯</div>
          No wagers yet — head to the Wager tab!
        </div>
      </div>
    )
  }

  let exact=0, correct=0, wrong=0, pending=0
  const rows = entries.map(([id, w]) => {
    const m = matches.find(x => matchId(x) === id)
    const pts = m ? scoreWager(w, m.score) : null

    if      (pts === null) pending++
    else if (pts === 3)    exact++
    else if (pts === 1)    correct++
    else                   wrong++

    const actualScore = m?.score?.ft ? `${m.score.ft[0]}–${m.score.ft[1]}` : null
    const predScore   = `${w.goals1}–${w.goals2}`

    let badgeClass = 'wbadge-pending', badgeIcon = '⏳'
    if      (pts === 3) { badgeClass='wbadge-exact';   badgeIcon='🎯' }
    else if (pts === 1) { badgeClass='wbadge-correct'; badgeIcon='✓' }
    else if (pts === 0) { badgeClass='wbadge-wrong';   badgeIcon='✗' }

    const t1 = m?.team1 || id
    const t2 = m?.team2 || ''

    const canDelete = pts === null  // can only delete before match is played

    return (
      <div className="wager-row" key={id}>
        <div className={`wager-result-badge ${badgeClass}`}>{badgeIcon}</div>
        <div className="wager-info">
          <div className="wager-matchup">
            {flag(t1)} {t1} vs {t2} {flag(t2)}
          </div>
          <div className="wager-pick-line">
            Your prediction: <span className="wager-pick-score">{predScore}</span>
            {w.goals1 > w.goals2 ? ` → ${t1} wins`
              : w.goals2 > w.goals1 ? ` → ${t2} wins`
              : ' → Draw'}
          </div>
          {actualScore && (
            <div className="actual-result">
              Final: <strong>{actualScore}</strong>
              {pts !== null && (
                <span style={{ marginLeft:8, color: pts>0?'var(--green)':'var(--red)', fontWeight:700 }}>
                  {pts > 0 ? `+${pts} pt${pts>1?'s':''}` : '0 pts'}
                </span>
              )}
            </div>
          )}
          {w.comment && <div className="wager-note">"{w.comment}"</div>}
        </div>
        {canDelete && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => deleteWager(id)}
            disabled={saving}
          >
            ✕
          </button>
        )}
      </div>
    )
  })

  const totalPts = exact * 3 + correct * 1
  const totalPlayed = exact + correct + wrong
  const accuracy = totalPlayed > 0 ? Math.round((exact+correct)/totalPlayed*100) : 0

  return (
    <div className="page">
      <div className="section-title">My Wagers</div>
      <div className="section-sub">Playing as <strong style={{ color:'var(--gold)' }}>{nickname}</strong></div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="num" style={{ color:'var(--gold)' }}>{totalPts}</div>
          <div className="lbl">Total pts</div>
        </div>
        <div className="stat-box">
          <div className="num" style={{ color:'#00A85A' }}>{exact}</div>
          <div className="lbl">Exact 🎯</div>
        </div>
        <div className="stat-box">
          <div className="num" style={{ color:'#5DCAA5' }}>{correct}</div>
          <div className="lbl">Correct</div>
        </div>
        <div className="stat-box">
          <div className="num" style={{ color:'var(--red)' }}>{wrong}</div>
          <div className="lbl">Wrong</div>
        </div>
        <div className="stat-box">
          <div className="num">{pending}</div>
          <div className="lbl">Pending</div>
        </div>
        <div className="stat-box">
          <div className="num">{accuracy}%</div>
          <div className="lbl">Accuracy</div>
        </div>
      </div>

      <div className="card">
        {rows}
      </div>
    </div>
  )
}
