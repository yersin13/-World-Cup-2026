import React, { useState } from 'react'
import { createBin } from '../utils/jsonbin'

export default function SetupPage() {
  const [apiKey, setApiKey]   = useState(import.meta.env.VITE_JSONBIN_API_KEY || '')
  const [binId, setBinId]     = useState(import.meta.env.VITE_JSONBIN_BIN_ID  || '')
  const [testing, setTesting] = useState(false)
  const [created, setCreated] = useState(false)
  const [err, setErr]         = useState('')

  const configured = !!(import.meta.env.VITE_JSONBIN_API_KEY && import.meta.env.VITE_JSONBIN_BIN_ID)

  const handleCreate = async () => {
    if (!apiKey.trim()) { setErr('Enter your API key first'); return }
    setTesting(true); setErr('')
    try {
      const id = await createBin(apiKey.trim())
      setBinId(id)
      setCreated(true)
    } catch(e) {
      setErr('Could not create bin. Check your API key.')
    }
    setTesting(false)
  }

  return (
    <div className="page">
      <div className="section-title">Setup</div>
      <div className="section-sub">Connect JSONBin.io so everyone shares the same wager data</div>

      <div className="setup-page" style={{ maxWidth:'100%', padding:0 }}>

        {configured && (
          <div className="setup-step" style={{ border:'1px solid rgba(0,135,90,0.4)', background:'var(--green-faint)' }}>
            <h3><span className="step-num" style={{ background:'var(--green)' }}>✓</span> All set!</h3>
            <p>JSONBin is configured. All wagers are shared in real-time with your friends.</p>
            <div className="code-block">BIN ID: {import.meta.env.VITE_JSONBIN_BIN_ID}</div>
          </div>
        )}

        <div className="setup-step">
          <h3><span className="step-num">1</span> Create a free JSONBin account</h3>
          <p>Go to <a href="https://jsonbin.io" target="_blank" rel="noreferrer" style={{ color:'var(--gold)' }}>jsonbin.io</a> → Sign up free → API Keys → copy your <strong>Secret Access Key</strong></p>
          <input
            placeholder="Paste your $2b$10$... API key here"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
        </div>

        <div className="setup-step">
          <h3><span className="step-num">2</span> Create your shared bin</h3>
          <p>Click below to auto-create a shared bin for your group. Do this once — then share the Bin ID with friends.</p>
          <button className="btn btn-primary" onClick={handleCreate} disabled={testing || !apiKey}>
            {testing ? 'Creating…' : '⚡ Create shared bin'}
          </button>
          {err && <p className="status-err" style={{ marginTop:8 }}>{err}</p>}
          {created && binId && (
            <div style={{ marginTop:12 }}>
              <p className="status-ok">✓ Bin created!</p>
              <div className="code-block" style={{ marginTop:8 }}>{binId}</div>
            </div>
          )}
          {binId && !created && <div className="code-block" style={{ marginTop:10 }}>{binId}</div>}
        </div>

        <div className="setup-step">
          <h3><span className="step-num">3</span> Add to your .env file</h3>
          <p>In the root of the project, create a <code style={{ color:'var(--gold)' }}>.env</code> file with:</p>
          <div className="code-block">
            VITE_JSONBIN_API_KEY={apiKey || 'your-api-key-here'}<br/>
            VITE_JSONBIN_BIN_ID={binId || 'your-bin-id-here'}
          </div>
          <p>Then restart the dev server: <code style={{ color:'var(--gold)' }}>npm run dev</code></p>
        </div>

        <div className="setup-step">
          <h3><span className="step-num">4</span> Deploy to Netlify</h3>
          <p>In Netlify dashboard → Site settings → Environment variables, add both keys above. Then deploy:</p>
          <div className="code-block">
            npm run build<br/>
            # drag the dist/ folder to netlify.com/drop<br/>
            # or: netlify deploy --prod --dir=dist
          </div>
          <p style={{ marginTop:8 }}>Share the Netlify URL with your friends. Everyone picks a nickname and starts wagering!</p>
        </div>
      </div>
    </div>
  )
}
