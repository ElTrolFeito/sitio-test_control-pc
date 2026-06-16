const API_BASE = ''

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
    return
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Error')
    throw new Error(errorText || `HTTP ${res.status}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

export async function login(username, password) {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

export async function getDevices() {
  return api('/api/devices')
}

export async function registerDevice(device) {
  return api('/api/devices/register', {
    method: 'POST',
    body: JSON.stringify(device)
  })
}

export async function getPcs() {
  return api('/api/pcs')
}

export async function createPc(pc) {
  return api('/api/pcs', {
    method: 'POST',
    body: JSON.stringify(pc)
  })
}

export async function sendWakeCommand(managedPcId) {
  return api('/api/commands/wake', {
    method: 'POST',
    body: JSON.stringify({ managedPcId })
  })
}
