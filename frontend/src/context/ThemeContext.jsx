import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  generateColorPalette,
  generateDarkPalette,
  generateThemeCSS,
  DEFAULT_PRIMARY
} from '../utils/colors'

const ThemeContext = createContext(null)

const STYLE_TAG_ID = 'custom-theme-overrides'

function applyThemeStyles(themeMode, primaryColor, customEnabled) {
  const root = document.documentElement

  // Dark mode class
  if (themeMode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Remove previous overrides
  const existing = document.getElementById(STYLE_TAG_ID)
  if (existing) existing.remove()

  if (!customEnabled || !primaryColor) return

  const lightPalette = generateColorPalette(primaryColor)
  if (!lightPalette) return

  // Dark palette is always derived from light regardless of current mode.
  // The CSS selectors handle which version applies per mode.
  const darkPalette = generateDarkPalette(lightPalette)

  const css = generateThemeCSS(lightPalette, darkPalette)
  const styleEl = document.createElement('style')
  styleEl.id = STYLE_TAG_ID
  styleEl.textContent = css
  document.head.appendChild(styleEl)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || DEFAULT_PRIMARY
  })

  const [customThemeEnabled, setCustomThemeEnabled] = useState(() => {
    return localStorage.getItem('customThemeEnabled') === 'true'
  })

  // Apply theme whenever any of the three values change
  useEffect(() => {
    applyThemeStyles(theme, primaryColor, customThemeEnabled)
    localStorage.setItem('theme', theme)
  }, [theme, primaryColor, customThemeEnabled])

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor)
  }, [primaryColor])

  useEffect(() => {
    localStorage.setItem('customThemeEnabled', customThemeEnabled ? 'true' : 'false')
  }, [customThemeEnabled])

  function toggleTheme() {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  function setThemeMode(mode) {
    setTheme(mode)
  }

  function updatePrimaryColor(color) {
    setPrimaryColor(color)
  }

  function enableCustomTheme(enabled) {
    setCustomThemeEnabled(enabled)
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      primaryColor,
      customThemeEnabled,
      toggleTheme,
      setThemeMode,
      updatePrimaryColor,
      enableCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
