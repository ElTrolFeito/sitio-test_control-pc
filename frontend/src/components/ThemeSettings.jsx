import { X, Sun, Moon, Palette, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import ColorPicker from './ColorPicker.jsx'
import { generateColorPalette, generateDarkPalette, DEFAULT_PRIMARY } from '../utils/colors'

export default function ThemeSettings({ onClose }) {
  const {
    theme,
    primaryColor,
    customThemeEnabled,
    rainbowMode,
    setThemeMode,
    updatePrimaryColor,
    enableCustomTheme,
    enableRainbow
  } = useTheme()

  const lightPalette = generateColorPalette(primaryColor) || {}
  const darkPalette = generateDarkPalette(lightPalette)
  const previewPalette = theme === 'dark' ? darkPalette : lightPalette

  const btnBg = previewPalette[600] || '#2563eb'
  const btnBgHover = previewPalette[700] || '#1d4ed8'
  const btnSecBg = (previewPalette[100] || '#dbeafe') + '4d'
  const btnSecText = previewPalette[700] || '#1d4ed8'
  const badgeBg = (previewPalette[50] || '#eff6ff') + '80'
  const badgeText = previewPalette[700] || '#1d4ed8'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" style={{ color: btnBg }} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Personalizar Tema
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Mode */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Modo
          </label>
          <div className="flex gap-2">
            {[
              { key: 'light', label: 'Claro', icon: Sun },
              { key: 'dark', label: 'Oscuro', icon: Moon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setThemeMode(key)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2"
                style={theme === key ? {
                  backgroundColor: btnBg + '1a',
                  color: btnBg,
                  borderColor: btnBg
                } : {
                  backgroundColor: 'transparent',
                  color: '',
                  borderColor: 'transparent'
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
                {theme === key && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Theme Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Color Personalizado
              {rainbowMode && (
                <span className="ml-2 text-xs font-normal" style={{ background: 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Rainbow activo
                </span>
              )}
            </label>
            <button
              onClick={() => enableCustomTheme(!customThemeEnabled)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: customThemeEnabled ? btnBg : '' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  customThemeEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Elige tu propio color para botones y acentos
          </p>
        </div>

        {/* Color Picker */}
        {customThemeEnabled && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <ColorPicker color={primaryColor} onChange={updatePrimaryColor} />
          </div>
        )}

        {/* Live Preview */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Vista Previa
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: btnBg }}
            >
              Boton Principal
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: btnSecBg, color: btnSecText }}
            >
              Boton Secundario
            </button>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: badgeBg, color: badgeText }}
            >
              Badge
            </span>
          </div>

          {/* Palette swatch */}
          <div className="flex gap-1">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
              <div
                key={shade}
                className="flex-1 h-6 rounded"
                style={{ backgroundColor: previewPalette[shade] || '#2563eb' }}
                title={`${shade}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              updatePrimaryColor(DEFAULT_PRIMARY)
              enableCustomTheme(false)
              setThemeMode('light')
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: btnBg }}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}
