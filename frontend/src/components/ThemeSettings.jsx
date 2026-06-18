import { X, Sun, Moon, Palette, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import ColorPicker from './ColorPicker.jsx'
import { generateColorPalette, generateDarkPalette, DEFAULT_PRIMARY } from '../utils/colors'

export default function ThemeSettings({ onClose }) {
  const {
    theme,
    primaryColor,
    customThemeEnabled,
    setThemeMode,
    updatePrimaryColor,
    enableCustomTheme
  } = useTheme()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-600" />
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

        {/* Theme Mode Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Modo
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border-2 border-transparent'
                }`}
            >
              <Sun className="w-4 h-4" />
              Claro
              {theme === 'light' && <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border-2 border-transparent'
                }`}
            >
              <Moon className="w-4 h-4" />
              Oscuro
              {theme === 'dark' && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Custom Theme Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Color Personalizado
            </label>
            <button
              onClick={() => enableCustomTheme(!customThemeEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${customThemeEnabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${customThemeEnabled ? 'translate-x-6' : 'translate-x-1'
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

        {/* Preview */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Vista Previa
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Boton Principal
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Boton Secundario
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-medium">
              Badge
            </span>
          </div>
          <div className="mt-3 flex gap-1">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => {
              const palette = theme === 'dark'
                ? generateDarkPalette(generateColorPalette(primaryColor))
                : generateColorPalette(primaryColor)
              return (
                <div
                  key={shade}
                  className="flex-1 h-6 rounded"
                  style={{ backgroundColor: palette?.[shade] || '#2563eb' }}
                  title={`Shade ${shade}`}
                />
              )
            })}
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
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}
