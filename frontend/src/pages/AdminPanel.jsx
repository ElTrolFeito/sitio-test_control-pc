import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  getAdminUsers, createUser, getAdminDevices, deleteDevice,
  getAdminPcs, deletePc, adminSendWakeCommand
} from '../api/client.js'
import { Monitor, Plus, Zap, X, Server, Shield, Users, Trash2, Activity } from 'lucide-react'

export default function AdminPanel() {
  const [adminTab, setAdminTab] = useState('users')
  const [users, setUsers] = useState([])
  const [allDevices, setAllDevices] = useState([])
  const [allPcs, setAllPcs] = useState([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'USER' })
  const [loading, setLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAdminUsers()
      setUsers(data || [])
    } catch (err) {
      console.error('loadUsers error:', err)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAdminDevices()
      setAllDevices(data || [])
    } catch (err) {
      console.error('loadDevices error:', err)
      toast.error('Error al cargar dispositivos')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPcs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAdminPcs()
      setAllPcs(data || [])
    } catch (err) {
      console.error('loadPcs error:', err)
      toast.error('Error al cargar PCs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (adminTab === 'users') loadUsers()
    if (adminTab === 'devices') loadDevices()
    if (adminTab === 'pcs') loadPcs()
  }, [adminTab, loadUsers, loadDevices, loadPcs])

  async function handleCreateUser(e) {
    e.preventDefault()
    if (!userForm.username.trim() || !userForm.password.trim()) {
      toast.error('Completa todos los campos')
      return
    }
    try {
      await createUser(userForm)
      toast.success('Usuario creado')
      setUserForm({ username: '', password: '', role: 'USER' })
      setShowUserForm(false)
      loadUsers()
    } catch (err) {
      toast.error(err.message || 'Error al crear usuario')
    }
  }

  async function handleDeleteDevice(id) {
    if (!window.confirm('Estas seguro de eliminar este dispositivo?')) return
    try {
      await deleteDevice(id)
      toast.success('Dispositivo eliminado')
      loadDevices()
    } catch (err) {
      toast.error(err.message || 'Error al eliminar')
    }
  }

  async function handleDeletePc(id) {
    if (!window.confirm('Estas seguro de eliminar este PC?')) return
    try {
      await deletePc(id)
      toast.success('PC eliminado')
      loadPcs()
    } catch (err) {
      toast.error(err.message || 'Error al eliminar')
    }
  }

  async function handleAdminWake(pcId) {
    try {
      await adminSendWakeCommand(pcId)
      toast.success('Comando Wake On LAN enviado')
    } catch (err) {
      toast.error(err.message || 'Error al enviar comando')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Panel de Administracion</h2>
        </div>
        <div className="flex gap-1 px-6 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          {[
            { key: 'users', label: 'Usuarios', icon: Users },
            { key: 'devices', label: 'Dispositivos', icon: Server },
            { key: 'pcs', label: 'PCs', icon: Monitor },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${adminTab === tab.key ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Users Tab */}
        {!loading && adminTab === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Usuarios Registrados</h3>
              <button
                onClick={() => setShowUserForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Nuevo Usuario
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 rounded-r-lg">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {users.map(u => (
                    <tr key={u.id || u.username} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.enabled ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {u.enabled ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{u.id}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No hay usuarios registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {!loading && adminTab === 'devices' && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Todos los Dispositivos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Nombre</th>
                    <th className="px-4 py-3">Serial</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 rounded-r-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {allDevices.map(d => (
                    <tr key={d.id || d.serial} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{d.name}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{d.serial}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.username || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${d.enabled ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {d.enabled ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteDevice(d.id)}
                          className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allDevices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No hay dispositivos</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PCs Tab */}
        {!loading && adminTab === 'pcs' && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Todos los PCs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Nombre</th>
                    <th className="px-4 py-3">MAC</th>
                    <th className="px-4 py-3">Broadcast</th>
                    <th className="px-4 py-3">Dispositivo</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3 rounded-r-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {allPcs.map(pc => (
                    <tr key={pc.id || pc.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{pc.name}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{pc.macAddress}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{pc.broadcastIp}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{pc.deviceName || '-'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{pc.username || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAdminWake(pc.id)}
                            className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-medium"
                          >
                            <Zap className="w-3.5 h-3.5" /> Wake
                          </button>
                          <button
                            onClick={() => handleDeletePc(pc.id)}
                            className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allPcs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No hay PCs</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Crear Usuario</h3>
              <button onClick={() => setShowUserForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="nuevo_usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contrasena</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
