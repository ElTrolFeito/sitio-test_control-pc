import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  generateColorPalette,
  generateDarkPalette,
  DEFAULT_PRIMARY
} from '../utils/colors'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [primaryColor, setPrimaryColor] = useState(() => {
    const saved = localStorage.getItem('primaryColor')
    return saved || DEFAULT_PRIMARY
  })

  const [customThemeEnabled, setCustomThemeEnabled] = useState(() => {
    const saved = localStorage.getItem('customThemeEnabled')
    return saved === 'true'
  })

  // Apply theme and colors to document
  const applyTheme = useCallback((themeMode, primary, customEnabled) => {
    const root = document.documentElement

    // Apply dark/light mode
    if (themeMode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply custom colors if enabled
    if (customEnabled && primary) {
      const lightPalette = generateColorPalette(primary)
      if (lightPalette) {
        // For light mode, use the palette as-is
        // For dark mode, we flip the palette
        const palette = themeMode === 'dark' ? generateDarkPalette(lightPalette) : lightPalette

        Object.entries(palette).forEach(([shade, color]) => {
          root.style.setProperty(`--primary-${shade}`, color)
        })

        // Also set the base primary color for borders and shadows
        root.style.setProperty('--primary', lightPalette[500])
      }
    } else {
      // Reset to default Tailwind colors (remove custom vars)
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
      shades.forEach(shade => {
        root.style.removeProperty(`--primary-${shade}`)
      })
      root.style.removeProperty('--primary')
    }
  }, [])

  useEffect(() => {
    applyTheme(theme, primaryColor, customThemeEnabled)
    localStorage.setItem('theme', theme)
  }, [theme, primaryColor, customThemeEnabled, applyTheme])

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
