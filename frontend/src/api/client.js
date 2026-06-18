const API_BASE = ''

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

async function api(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    })
  } catch (err) {
    throw new Error('Network error: cannot connect to server')
  }

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
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

// Admin endpoints
export async function getAdminUsers() {
  return api('/admin/users')
}

export async function createUser(userData) {
  return api('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
}

export async function getAdminDevices() {
  return api('/admin/devices')
}

export async function deleteDevice(id) {
  return api(`/admin/devices/${id}`, { method: 'DELETE' })
}

export async function getAdminPcs() {
  return api('/admin/pcs')
}

export async function deletePc(id) {
  return api(`/admin/pcs/${id}`, { method: 'DELETE' })
}

export async function adminSendWakeCommand(managedPcId) {
  return api('/admin/commands/wake', {
    method: 'POST',
    body: JSON.stringify({ managedPcId })
  })
}
