import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { readBin, writeBin } from '../utils/jsonbin'
import { fetchMatches } from '../data/matches'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [matches, setMatches]       = useState([])
  const [binData, setBinData]       = useState({ wagers: {} })
  const [nickname, setNickname]     = useState(() => localStorage.getItem('wc_nick') || '')
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [lastSync, setLastSync]     = useState(null)

  const load = useCallback(async () => {
    const [mData, bData] = await Promise.all([fetchMatches(), readBin()])
    setMatches(mData)
    setBinData(bData || { wagers: {} })
    setLastSync(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const t = setInterval(load, 120_000)
    return () => clearInterval(t)
  }, [load])

  const saveNickname = (n) => {
    setNickname(n)
    localStorage.setItem('wc_nick', n)
  }

  const placeWager = async (matchId, goals1, goals2, comment = '') => {
    setSaving(true)
    const updated = {
      ...binData,
      wagers: {
        ...binData.wagers,
        [nickname]: {
          ...(binData.wagers[nickname] || {}),
          [matchId]: { goals1, goals2, comment, ts: Date.now() },
        },
      },
    }
    await writeBin(updated)
    setBinData(updated)
    setSaving(false)
  }

  const deleteWager = async (matchId) => {
    setSaving(true)
    const userWagers = { ...(binData.wagers[nickname] || {}) }
    delete userWagers[matchId]
    const updated = {
      ...binData,
      wagers: { ...binData.wagers, [nickname]: userWagers },
    }
    await writeBin(updated)
    setBinData(updated)
    setSaving(false)
  }

  return (
    <Ctx.Provider value={{
      matches, binData, nickname, loading, saving, lastSync,
      saveNickname, placeWager, deleteWager, refresh: load,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
