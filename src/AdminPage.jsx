import React, { useEffect, useMemo, useState } from 'react'
import { ADMIN_TOKEN_KEY, adminLogin, adminLogout, clearSubmissions, fetchSubmissions } from './api'

function formatDate(isoString) {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return isoString
  }
}

function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await adminLogin(username, password)
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
      onSuccess(token)
    } catch (err) {
      setError(err.message || 'Incorrect username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1>Admin sign in</h1>
        <p className="admin-sub">Restricted access — for site owner only.</p>

        <div className="admin-field">
          <label htmlFor="admin-username">Username</label>
          <input
            id="admin-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="admin-field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="admin-error">{error}</div>

        <button type="submit" className="admin-login-submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <a href="/" className="admin-back-link">
          ← Back to site
        </a>
      </form>
    </div>
  )
}

function AdminDashboard({ token, onLogout }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSubmissions = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSubmissions(token)
      setSubmissions(data)
    } catch (err) {
      setError(err.message || 'Failed to load submissions.')
      if (err.message && err.message.toLowerCase().includes('session')) {
        onLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClear = async () => {
    if (!window.confirm('Clear all stored submissions? This cannot be undone.')) return
    try {
      await clearSubmissions(token)
      setSubmissions([])
    } catch (err) {
      setError(err.message || 'Failed to clear submissions.')
    }
  }

  const count = useMemo(() => submissions.length, [submissions])

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h1>People who've reached out</h1>
          <p>
            {loading
              ? 'Loading…'
              : `${count} ${count === 1 ? 'submission' : 'submissions'} stored.`}
          </p>
        </div>
        <div className="admin-dashboard-actions">
          <button type="button" className="admin-btn" onClick={loadSubmissions}>
            Refresh
          </button>
          {count > 0 && (
            <button type="button" className="admin-btn admin-btn--danger" onClick={handleClear}>
              Clear all
            </button>
          )}
          <button type="button" className="admin-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {!loading && count === 0 ? (
        <div className="admin-empty">No one has submitted the "Talk to us" form yet.</div>
      ) : (
        <div className="admin-submissions">
          {submissions.map((entry) => (
            <div className="admin-submission-card" key={entry.id}>
              <div className="admin-submission-top">
                <div className="admin-submission-name">
                  {entry.first_name} {entry.last_name}
                </div>
                <div className="admin-submission-date">{formatDate(entry.submitted_at)}</div>
              </div>
              <div className="admin-submission-meta">
                {entry.email && <a href={`mailto:${entry.email}`}>{entry.email}</a>}
                {entry.phone && (
                  <a href={`tel:${entry.country_code || ''}${entry.phone}`}>
                    {entry.country_code ? `${entry.country_code} ` : ''}
                    {entry.phone}
                  </a>
                )}
              </div>
              {entry.message && <div className="admin-submission-message">{entry.message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY) || '')

  const handleLogout = () => {
    if (token) adminLogout(token)
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken('')
  }

  return (
    <div className="admin-page">
      {token ? (
        <AdminDashboard token={token} onLogout={handleLogout} />
      ) : (
        <AdminLogin onSuccess={(newToken) => setToken(newToken)} />
      )}
    </div>
  )
}
