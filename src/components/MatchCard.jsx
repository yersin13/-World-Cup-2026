import React from 'react'
import { flag } from '../data/matches'

function matchStatus(m) {
  if (m.score?.ft) return 'done'
  const md = new Date(m.date + 'T20:00:00')
  const diff = md - new Date()
  if (diff < 0 && diff > -7_200_000) return 'live'
  return 'soon'
}

export default function MatchCard({ match, children, compact = false }) {
  const st = matchStatus(match)
  const [g1, g2] = match.score?.ft ?? [null, null]

  const badge =
    st === 'live' ? <span className="status-badge badge-live">● Live</span>
    : st === 'done' ? <span className="status-badge badge-ft">FT</span>
    : <span className="status-badge badge-soon">{match.date}</span>

  return (
    <div className="match-card">
      <div className="match-header">
        {match.group && <span className="match-group-tag">{match.group}</span>}
        <span className="match-round">{match.round}</span>
        {match.ground && <span className="match-venue">📍 {match.ground}</span>}
      </div>
      <div className="match-body">
        <div className="team-block">
          <span className="team-flag">{flag(match.team1)}</span>
          <span className="team-name">{match.team1}</span>
        </div>

        <div className="score-block">
          <span className="score-num">{g1 ?? '–'}</span>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span className="score-sep">:</span>
            {badge}
          </div>
          <span className="score-num">{g2 ?? '–'}</span>
        </div>

        <div className="team-block right">
          <span className="team-flag">{flag(match.team2)}</span>
          <span className="team-name">{match.team2}</span>
        </div>
      </div>
      {children}
    </div>
  )
}
