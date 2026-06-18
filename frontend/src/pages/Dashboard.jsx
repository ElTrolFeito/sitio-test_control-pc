import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getDevices, getPcs, registerDevice, createPc, sendWakeCommand
} from '../api/client.js'
import Layout from '../components/Layout.jsx'
import AdminPanel from './AdminPanel.jsx'
import { Monitor, Cpu, Plus, Zap, X, Server, Wifi, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Shield, Activity } from 'lucide-react'

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  const [devices, setDevices] = useState([])
  const [pcs, setPcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeviceForm, setShowDeviceForm] = useState(false)
  const [showPcForm, setShowPcForm] = useState(false)
  const [deviceForm, setDeviceForm] = useState({ name: '', serial: '' })
  const [pcForm, setPcForm] = useState({ deviceId: '', name: '', macAddress: '', broadcastIp: '' })

  async function loadData() {
    try {
      const [devs, p] = await Promise.all([getDevices(), getPcs()])
      setDevices(devs || [])
      setPcs(p || [])
    } catch (err) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleAddDevice(e) {
    e.preventDefault()
    if (!deviceForm.name.trim() || !deviceForm.serial.trim()) {
      toast.error('Completa todos los campos')
      return
    }
    try {
      await registerDevice(deviceForm)
      // Reload full device list so the PC dropdown has proper id/name fields
      await loadData()
      toast.success('Dispositivo registrado')
      setDeviceForm({ name: '', serial: '' })
      setShowDeviceForm(false)
    } catch (err) {
      toast.error(err.message || 'Error al registrar dispositivo')
    }
  }

  async function handleAddPc(e) {
    e.preventDefault()
    if (!pcForm.deviceId || !pcForm.name.trim() || !pcForm.macAddress.trim() || !pcForm.broadcastIp.trim()) {
      toast.error('Completa todos los campos')
      return
    }
    try {
      const result = await createPc(pcForm)
      setPcs(prev => [...prev, result])
      toast.success('PC agregado')
      setPcForm({ deviceId: '', name: '', macAddress: '', broadcastIp: '' })
      setShowPcForm(false)
    } catch (err) {
      toast.error(err.message || 'Error al agregar PC')
    }
  }

  async function handleWake(pcId) {
    try {
      await sendWakeCommand(pcId)
      toast.success('Comando Wake On LAN enviado')
    } catch (err) {
      toast.error(err.message || 'Error al enviar comando')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {isAdmin && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" /> Dashboard
            </div>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'admin' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admin Panel
            </div>
          </button>
        </div>
      )}

      {activeTab === 'dashboard' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Devices */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Dispositivos</h2>
                  <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{devices.length}</span>
                </div>
                <button
                  onClick={() => setShowDeviceForm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {devices.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                    <Cpu className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No hay dispositivos registrados
                  </div>
                ) : (
                  devices.map(d => (
                    <div key={d.id} className="px-6 py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                          <Cpu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{d.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{d.serial}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${d.enabled ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {d.enabled ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {d.enabled ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PCs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">PCs Administrados</h2>
                  <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{pcs.length}</span>
                </div>
                <button
                  onClick={() => setShowPcForm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {pcs.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                    <Monitor className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No hay PCs registrados
                  </div>
                ) : (
                  pcs.map(pc => (
                    <div key={pc.id} className="px-6 py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <Monitor className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{pc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono">{pc.macAddress}</span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span className="font-mono">{pc.broadcastIp}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleWake(pc.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shrink-0"
                        title="Enviar Wake On LAN"
                      >
                        <Zap className="w-4 h-4" />
                        <span className="hidden sm:inline">Wake</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Add Device Modal */}
          {showDeviceForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Registrar Dispositivo</h3>
                  <button onClick={() => setShowDeviceForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddDevice} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={deviceForm.name}
                      onChange={e => setDeviceForm({ ...deviceForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Raspberry Pi Living Room"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serial</label>
                    <input
                      type="text"
                      value={deviceForm.serial}
                      onChange={e => setDeviceForm({ ...deviceForm, serial: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="RPi-001"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowDeviceForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Registrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add PC Modal */}
          {showPcForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Agregar PC</h3>
                  <button onClick={() => setShowPcForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddPc} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dispositivo</label>
                    <select
                      value={pcForm.deviceId}
                      onChange={e => setPcForm({ ...pcForm, deviceId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Seleccionar dispositivo...</option>
                      {devices.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={pcForm.name}
                      onChange={e => setPcForm({ ...pcForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="PC Oficina"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Direccion MAC</label>
                    <input
                      type="text"
                      value={pcForm.macAddress}
                      onChange={e => setPcForm({ ...pcForm, macAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                      placeholder="00:11:22:33:44:55"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IP Broadcast</label>
                    <div className="relative">
                      <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        value={pcForm.broadcastIp}
                        onChange={e => setPcForm({ ...pcForm, broadcastIp: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                        placeholder="192.168.1.255"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowPcForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Agregar PC
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <AdminPanel />
      )}
    </Layout>
  )
}
