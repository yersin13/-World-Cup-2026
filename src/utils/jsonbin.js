// JSONBin.io shared storage
// Set these in .env or directly here after creating your bin

const BIN_ID  = import.meta.env.VITE_JSONBIN_BIN_ID  || ''
const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY  || ''
const BASE    = 'https://api.jsonbin.io/v3/b'

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY,
    'X-Bin-Versioning': 'false',
  }
}

export async function readBin() {
  if (!BIN_ID || !API_KEY) return getLocalData()
  try {
    const r = await fetch(`${BASE}/${BIN_ID}/latest`, { headers: headers() })
    if (!r.ok) throw new Error('read failed')
    const j = await r.json()
    return j.record
  } catch (e) {
    console.warn('JSONBin read failed, using local:', e)
    return getLocalData()
  }
}

export async function writeBin(data) {
  setLocalData(data)
  if (!BIN_ID || !API_KEY) return data
  try {
    const r = await fetch(`${BASE}/${BIN_ID}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    })
    if (!r.ok) throw new Error('write failed')
    return data
  } catch (e) {
    console.warn('JSONBin write failed:', e)
    return data
  }
}

export async function createBin(apiKey) {
  try {
    const r = await fetch('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
        'X-Bin-Name': 'WC2026-Wager',
        'X-Bin-Private': 'false',
      },
      body: JSON.stringify({ wagers: {}, version: 1 }),
    })
    if (!r.ok) throw new Error('create failed')
    const j = await r.json()
    return j.metadata.id
  } catch (e) {
    throw e
  }
}

export function isConfigured() {
  return !!(BIN_ID && API_KEY)
}

// Local fallback
function getLocalData() {
  try { return JSON.parse(localStorage.getItem('wc_data') || '{"wagers":{}}') }
  catch { return { wagers: {} } }
}
function setLocalData(d) {
  try { localStorage.setItem('wc_data', JSON.stringify(d)) } catch {}
}
