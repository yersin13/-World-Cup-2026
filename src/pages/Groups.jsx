import React from 'react'
import { useApp } from '../hooks/useApp'
import { flag } from '../data/matches'

export default function GroupsPage() {
  const { matches } = useApp()

  const groups = {}
  for (const m of matches) {
    const g = m.group || 'Unknown'
    if (!groups[g]) groups[g] = { name: g, teams: {} }
    for (const t of [m.team1, m.team2]) {
      if (!groups[g].teams[t]) groups[g].teams[t] = { name:t, p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0 }
    }
    if (m.score?.ft) {
      const [g1, g2] = m.score.ft
      const t1 = groups[g].teams[m.team1]
      const t2 = groups[g].teams[m.team2]
      t1.p++; t2.p++; t1.gf+=g1; t1.ga+=g2; t2.gf+=g2; t2.ga+=g1
      if      (g1 > g2) { t1.w++; t1.pts+=3; t2.l++ }
      else if (g2 > g1) { t2.w++; t2.pts+=3; t1.l++ }
      else              { t1.d++; t2.d++; t1.pts++; t2.pts++ }
    }
  }

  const sorted = Object.values(groups).sort((a,b) => a.name.localeCompare(b.name))

  if (!sorted.length) {
    return <div className="page"><div className="spinner">Loading groups…</div></div>
  }

  return (
    <div className="page">
      <div className="section-title">Group Standings</div>
      <div className="section-sub">
        Top 2 teams from each group advance to Round of 32 · <span style={{ color:'var(--green)' }}>■</span> = qualified
      </div>

      <div className="groups-grid">
        {sorted.map(g => {
          const teams = Object.values(g.teams).sort((a,b) =>
            b.pts - a.pts || (b.gf-b.ga) - (a.gf-a.ga) || b.gf - a.gf
          )
          return (
            <div className="group-card" key={g.name}>
              <div className="group-card-header">
                {g.name}
                <span style={{ fontSize:11, color:'var(--slate)', fontFamily:'Inter, sans-serif', fontWeight:400, letterSpacing:0 }}>
                  {teams[0].p} played
                </span>
              </div>
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>P</th><th>W</th><th>D</th><th>L</th>
                    <th>GF</th><th>GA</th><th>GD</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => (
                    <tr key={t.name} className={i < 2 ? 'advance' : ''}>
                      <td>
                        <span style={{ marginRight:6 }}>{flag(t.name)}</span>
                        {t.name}
                      </td>
                      <td>{t.p}</td>
                      <td>{t.w}</td>
                      <td>{t.d}</td>
                      <td>{t.l}</td>
                      <td>{t.gf}</td>
                      <td>{t.ga}</td>
                      <td style={{ color: t.gf-t.ga>0?'var(--green)':t.gf-t.ga<0?'var(--red)':'var(--slate)' }}>
                        {t.gf-t.ga > 0 ? '+' : ''}{t.gf-t.ga}
                      </td>
                      <td className="pts">{t.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
