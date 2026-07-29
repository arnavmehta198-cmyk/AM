// Thin client for the Supabase Edge Functions that back the "Talk to us"
// form and the admin dashboard. No secrets live here — the admin password
// check and all database access happen server-side inside the functions.

const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL

if (!FUNCTIONS_BASE) {
  console.error(
    'Missing VITE_SUPABASE_FUNCTIONS_URL. Copy .env.example to .env and set your Supabase functions URL.'
  )
}

export const ADMIN_TOKEN_KEY = 'am_admin_token'

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

export async function submitContactForm(values) {
  const response = await fetch(`${FUNCTIONS_BASE}/submit-contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  const data = await parseJsonSafe(response)
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong submitting the form.')
  }
  return data
}

export async function adminLogin(username, password) {
  const response = await fetch(`${FUNCTIONS_BASE}/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await parseJsonSafe(response)
  if (!response.ok) {
    throw new Error(data.error || 'Incorrect username or password.')
  }
  return data
}

export async function fetchSubmissions(token) {
  const response = await fetch(`${FUNCTIONS_BASE}/admin-submissions`, {
    method: 'GET',
    headers: { 'x-admin-token': token },
  })
  const data = await parseJsonSafe(response)
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load submissions.')
  }
  return data.submissions || []
}

export async function clearSubmissions(token) {
  const response = await fetch(`${FUNCTIONS_BASE}/admin-submissions`, {
    method: 'DELETE',
    headers: { 'x-admin-token': token },
  })
  const data = await parseJsonSafe(response)
  if (!response.ok) {
    throw new Error(data.error || 'Failed to clear submissions.')
  }
  return data
}

export async function adminLogout(token) {
  try {
    await fetch(`${FUNCTIONS_BASE}/admin-submissions?action=logout`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    })
  } catch {
    // Best effort — the local token is cleared regardless by the caller.
  }
}
