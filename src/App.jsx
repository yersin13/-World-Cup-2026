import React, { useState } from 'react'
import { AppProvider, useApp } from './hooks/useApp'
import MatchesPage     from './pages/Matches'
import WagerPage       from './pages/Wager'
import MyWagersPage    from './pages/MyWagers'
import LeaderboardPage from './pages/Leaderboard'
import GroupsPage      from './pages/Groups'
import SetupPage       from './pages/Setup'

const TABS = [
  { id:'matches',     label:'Matches',     icon:'⚽' },
  { id:'wager',       label:'Wager',       icon:'🎯' },
  { id:'mywagers',    label:'My Wagers',   icon:'📋' },
  { id:'leaderboard', label:'Leaderboard', icon:'🏆' },
  { id:'groups',      label:'Groups',      icon:'📊' },
  { id:'setup',       label:'Setup',       icon:'⚙️' },
]

function Nav({ active, setActive }) {
  const { nickname, binData } = useApp()
  const myCount = nickname ? Object.keys(binData?.wagers?.[nickname] || {}).length : 0

  return (
    <nav className="nav">
      <div className="nav-brand">⚽ WC 2026</div>
      <div className="nav-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-tab ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            <span className="icon">{t.icon}</span>
            {t.label}
            {t.id === 'mywagers' && myCount > 0 && (
              <span style={{
                background:'var(--gold)', color:'var(--navy)',
                borderRadius:20, fontSize:10, fontWeight:800,
                padding:'1px 6px', marginLeft:2,
              }}>{myCount}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

function Content({ active }) {
  switch(active) {
    case 'matches':     return <MatchesPage />
    case 'wager':       return <WagerPage />
    case 'mywagers':    return <MyWagersPage />
    case 'leaderboard': return <LeaderboardPage />
    case 'groups':      return <GroupsPage />
    case 'setup':       return <SetupPage />
    default:            return <MatchesPage />
  }
}

function Inner() {
  const [active, setActive] = useState('matches')
  return (
    <>
      <Nav active={active} setActive={setActive} />
      <Content active={active} />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
