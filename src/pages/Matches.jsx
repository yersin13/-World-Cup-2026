import React, { useState } from 'react'
import { useApp } from '../hooks/useApp'
import MatchCard from '../components/MatchCard'

export default function MatchesPage() {
  const { matches, binData, lastSync, refresh, loading } = useApp()
  const [filter, setFilter] = useState('all')

  const totalWagers = Object.values(binData.wagers || {})
    .reduce((s, u) => s + Object.keys(u).length, 0)
  const played = matches.filter(m => m.score?.ft).length
  const players = Object.keys(binData.wagers || {}).length

  const groups = [...new Set(matches.map(m => m.group).filter(Boolean))].sort()

  const filtered = filter === 'all' ? matches
    : filter === 'live' ? matches.filter(m => !m.score?.ft)
    : matches.filter(m => m.group === filter)

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:4 }}>
        <div>
          <div className="section-title">⚽ World Cup 2026</div>
          <div className="section-sub">
            Auto-updated from openfootball · {lastSync ? `Last sync ${lastSync.toLocaleTimeString()}` : 'Loading...'}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
          ↻ Refresh
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="num">{matches.length}</div><div className="lbl">Matches</div></div>
        <div className="stat-box"><div className="num">{played}</div><div className="lbl">Played</div></div>
        <div className="stat-box"><div className="num">{players}</div><div className="lbl">Players</div></div>
        <div className="stat-box"><div className="num">{totalWagers}</div><div className="lbl">Wagers</div></div>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {['all','live',...groups].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter===f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'live' ? 'Upcoming' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner">Loading matches…</div>
      ) : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🔍</div>No matches found</div>
      ) : (
        filtered.map(m => (
          <MatchCard key={m.num ?? m.team1+m.team2} match={m} />
        ))
      )}
    </div>
  )
}
