export const FLAGS = {
  'Mexico':'🇲🇽','South Africa':'🇿🇦','South Korea':'🇰🇷','Czech Republic':'🇨🇿',
  'USA':'🇺🇸','United States':'🇺🇸','Germany':'🇩🇪','France':'🇫🇷',
  'Brazil':'🇧🇷','Argentina':'🇦🇷','England':'🏴󠁧󠁢󠁥󠁬󠁴','Spain':'🇪🇸',
  'Portugal':'🇵🇹','Netherlands':'🇳🇱','Italy':'🇮🇹','Belgium':'🇧🇪',
  'Croatia':'🇭🇷','Uruguay':'🇺🇾','Colombia':'🇨🇴','Ecuador':'🇪🇨',
  'Senegal':'🇸🇳','Morocco':'🇲🇦','Japan':'🇯🇵','Australia':'🇦🇺',
  'Canada':'🇨🇦','Saudi Arabia':'🇸🇦','Iran':'🇮🇷','Poland':'🇵🇱',
  'Denmark':'🇩🇰','Switzerland':'🇨🇭','Serbia':'🇷🇸','Cameroon':'🇨🇲',
  'Ghana':'🇬🇭','Tunisia':'🇹🇳','Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿','Qatar':'🇶🇦',
  'New Zealand':'🇳🇿','Costa Rica':'🇨🇷','Turkey':'🇹🇷','Ukraine':'🇺🇦',
  'Austria':'🇦🇹','Hungary':'🇭🇺','Slovakia':'🇸🇰','Romania':'🇷🇴',
  'Greece':'🇬🇷','Albania':'🇦🇱','Slovenia':'🇸🇮','Georgia':'🇬🇪',
  'Venezuela':'🇻🇪','Chile':'🇨🇱','Peru':'🇵🇪','Paraguay':'🇵🇾',
  'Bolivia':'🇧🇴','Nigeria':'🇳🇬','Ivory Coast':'🇨🇮','Egypt':'🇪🇬',
  'Algeria':'🇩🇿','Zambia':'🇿🇲','DR Congo':'🇨🇩','Indonesia':'🇮🇩',
  'Iraq':'🇮🇶','Palestine':'🇵🇸','Jordan':'🇯🇴','Cuba':'🇨🇺',
  'Panama':'🇵🇦','Honduras':'🇭🇳','Jamaica':'🇯🇲','El Salvador':'🇸🇻',
  'Trinidad and Tobago':'🇹🇹','New Caledonia':'🇳🇨','Guatemala':'🇬🇹',
  'Kenya':'🇰🇪','Tanzania':'🇹🇿','Ethiopia':'🇪🇹','Angola':'🇦🇴',
}

export const flag = (name) => FLAGS[name] || '🏳️'

export const AVATAR_COLORS = [
  '#005F33','#185FA5','#A32D2D','#854F0B',
  '#534AB7','#0F6E56','#993556','#3B6D11',
]

export function avatarColor(name) {
  let h = 0
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

export function initials(name) {
  return String(name).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Scoring rules
export const POINTS = {
  exact: 3,    // exact score e.g. 2-1 predicted 2-1
  result: 1,   // correct outcome (W/D/L) but wrong goals
}

export function scoreWager(predicted, actual) {
  if (!actual || actual.ft === null) return null  // not played yet
  const [ag1, ag2] = actual.ft
  const pg1 = predicted.goals1
  const pg2 = predicted.goals2
  if (pg1 === ag1 && pg2 === ag2) return POINTS.exact
  const actualResult = ag1 > ag2 ? 'home' : ag2 > ag1 ? 'away' : 'draw'
  const predResult   = pg1 > pg2 ? 'home' : pg2 > pg1 ? 'away' : 'draw'
  if (actualResult === predResult) return POINTS.result
  return 0
}

export function matchResult(match) {
  if (!match?.score?.ft) return null
  const [g1, g2] = match.score.ft
  if (g1 > g2) return 'home'
  if (g2 > g1) return 'away'
  return 'draw'
}

export function matchId(m) {
  return m.num != null ? String(m.num) : `${m.team1}__${m.team2}__${m.date}`
}

// Fetch live data from openfootball (free, no key)
export async function fetchMatches() {
  try {
    const url = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'
    const r = await fetch(url)
    if (!r.ok) throw new Error('fetch failed')
    const d = await r.json()
    return d.matches || []
  } catch {
    return FALLBACK_MATCHES
  }
}

// Fallback static data (first 16 MD1 matches + some upcoming)
export const FALLBACK_MATCHES = [
  { num:1,  date:'2026-06-11', team1:'Mexico',      team2:'South Africa', score:{ ft:[2,0] }, group:'Group A', ground:'Mexico City',     round:'Matchday 1' },
  { num:2,  date:'2026-06-11', team1:'South Korea', team2:'Czech Republic',score:{ ft:[2,1] }, group:'Group A', ground:'Guadalajara',     round:'Matchday 1' },
  { num:3,  date:'2026-06-12', team1:'USA',         team2:'Panama',       score:{ ft:[3,0] }, group:'Group B', ground:'Los Angeles',      round:'Matchday 1' },
  { num:4,  date:'2026-06-12', team1:'Uruguay',     team2:'Bolivia',      score:{ ft:[1,1] }, group:'Group B', ground:'Miami',            round:'Matchday 1' },
  { num:5,  date:'2026-06-13', team1:'Germany',     team2:'Saudi Arabia', score:{ ft:[4,0] }, group:'Group C', ground:'Dallas',           round:'Matchday 1' },
  { num:6,  date:'2026-06-13', team1:'Japan',       team2:'Venezuela',    score:{ ft:[1,0] }, group:'Group C', ground:'Seattle',          round:'Matchday 1' },
  { num:7,  date:'2026-06-14', team1:'France',      team2:'Algeria',      score:{ ft:null  }, group:'Group D', ground:'New York',         round:'Matchday 1' },
  { num:8,  date:'2026-06-14', team1:'Argentina',   team2:'Peru',         score:{ ft:null  }, group:'Group D', ground:'Chicago',          round:'Matchday 1' },
  { num:9,  date:'2026-06-15', team1:'England',     team2:'Tunisia',      score:{ ft:null  }, group:'Group E', ground:'Boston',           round:'Matchday 1' },
  { num:10, date:'2026-06-15', team1:'Spain',       team2:'Costa Rica',   score:{ ft:null  }, group:'Group E', ground:'Toronto',          round:'Matchday 1' },
  { num:11, date:'2026-06-16', team1:'Brazil',      team2:'Paraguay',     score:{ ft:null  }, group:'Group F', ground:'Houston',          round:'Matchday 1' },
  { num:12, date:'2026-06-16', team1:'Portugal',    team2:'Ecuador',      score:{ ft:null  }, group:'Group F', ground:'Vancouver',        round:'Matchday 1' },
  { num:13, date:'2026-06-17', team1:'Netherlands', team2:'Iraq',         score:{ ft:null  }, group:'Group G', ground:'Philadelphia',     round:'Matchday 1' },
  { num:14, date:'2026-06-17', team1:'Belgium',     team2:'Palestine',    score:{ ft:null  }, group:'Group G', ground:'Kansas City',      round:'Matchday 1' },
  { num:15, date:'2026-06-18', team1:'Croatia',     team2:'Nigeria',      score:{ ft:null  }, group:'Group H', ground:'Atlanta',          round:'Matchday 1' },
  { num:16, date:'2026-06-18', team1:'Italy',       team2:'El Salvador',  score:{ ft:null  }, group:'Group H', ground:'San Francisco',    round:'Matchday 1' },
  { num:17, date:'2026-06-19', team1:'Australia',   team2:'Morocco',      score:{ ft:null  }, group:'Group I', ground:'Los Angeles',      round:'Matchday 1' },
  { num:18, date:'2026-06-19', team1:'Colombia',    team2:'Venezuela',    score:{ ft:null  }, group:'Group I', ground:'Miami',            round:'Matchday 1' },
  { num:19, date:'2026-06-20', team1:'Denmark',     team2:'Serbia',       score:{ ft:null  }, group:'Group J', ground:'Dallas',           round:'Matchday 1' },
  { num:20, date:'2026-06-20', team1:'Chile',       team2:'Honduras',     score:{ ft:null  }, group:'Group J', ground:'Boston',           round:'Matchday 1' },
  { num:21, date:'2026-06-21', team1:'Poland',      team2:'Austria',      score:{ ft:null  }, group:'Group K', ground:'Chicago',          round:'Matchday 1' },
  { num:22, date:'2026-06-21', team1:'Romania',     team2:'Ukraine',      score:{ ft:null  }, group:'Group K', ground:'Seattle',          round:'Matchday 1' },
  { num:23, date:'2026-06-22', team1:'Switzerland', team2:'Cameroon',     score:{ ft:null  }, group:'Group L', ground:'New York',         round:'Matchday 1' },
  { num:24, date:'2026-06-22', team1:'Egypt',       team2:'Ecuador',      score:{ ft:null  }, group:'Group L', ground:'Toronto',          round:'Matchday 1' },
]
