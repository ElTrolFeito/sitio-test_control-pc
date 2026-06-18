import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import {
  generateColorPalette,
  generateDarkPalette,
  generateThemeCSS,
  hslToRgb,
  rgbToHex,
  DEFAULT_PRIMARY
} from '../utils/colors'

const ThemeContext = createContext(null)

const STYLE_TAG_ID = 'custom-theme-overrides'

function applyThemeStyles(themeMode, primaryColor, customEnabled) {
  const root = document.documentElement

  if (themeMode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  const existing = document.getElementById(STYLE_TAG_ID)
  if (existing) existing.remove()

  if (!customEnabled || !primaryColor) return

  const lightPalette = generateColorPalette(primaryColor)
  if (!lightPalette) return

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

  const [rainbowMode, setRainbowMode] = useState(() => {
    return localStorage.getItem('rainbowMode') === 'true'
  })

  const rainbowRef = useRef(null)
  const rainbowHueRef = useRef(0)

  // Stop any running rainbow animation
  const stopRainbow = useCallback(() => {
    if (rainbowRef.current) {
      clearInterval(rainbowRef.current)
      rainbowRef.current = null
    }
  }, [])

  // Start rainbow animation — cycles hue at ~20fps
  const startRainbow = useCallback((currentTheme, currentCustom) => {
    stopRainbow()
    rainbowRef.current = setInterval(() => {
      rainbowHueRef.current = (rainbowHueRef.current + 1.2) % 360
      const h = rainbowHueRef.current
      const [r, g, b] = hslToRgb(h, 90, 50)
      const hex = rgbToHex(r, g, b)
      setPrimaryColor(hex)
      // Directly apply styles without going through the effect cycle for smooth animation
      applyThemeStyles(currentTheme, hex, true)
    }, 50)
  }, [stopRainbow])

  // Apply theme whenever mode, color, or custom-enabled changes
  useEffect(() => {
    if (!rainbowMode) {
      applyThemeStyles(theme, primaryColor, customThemeEnabled)
    }
    localStorage.setItem('theme', theme)
  }, [theme, primaryColor, customThemeEnabled, rainbowMode])

  // Manage rainbow lifecycle
  useEffect(() => {
    localStorage.setItem('rainbowMode', rainbowMode ? 'true' : 'false')
    if (rainbowMode) {
      startRainbow(theme, customThemeEnabled)
    } else {
      stopRainbow()
      applyThemeStyles(theme, primaryColor, customThemeEnabled)
    }
    return () => stopRainbow()
  }, [rainbowMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // When theme mode changes while rainbow is running, restart so the closure has the new mode
  useEffect(() => {
    if (rainbowMode) {
      startRainbow(theme, customThemeEnabled)
    }
  }, [theme]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!enabled && rainbowMode) {
      setRainbowMode(false)
    }
  }

  function enableRainbow(enabled) {
    if (enabled && !customThemeEnabled) {
      setCustomThemeEnabled(true)
    }
    setRainbowMode(enabled)
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      primaryColor,
      customThemeEnabled,
      rainbowMode,
      toggleTheme,
      setThemeMode,
      updatePrimaryColor,
      enableCustomTheme,
      enableRainbow
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
