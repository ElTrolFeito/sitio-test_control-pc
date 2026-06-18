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

function playFlashbangSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime

    // Explosion burst — short white noise with sharp decay
    const bufLen = Math.floor(ctx.sampleRate * 0.18)
    const noiseBuffer = ctx.createBuffer(2, bufLen, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = noiseBuffer.getChannelData(ch)
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen)
      }
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(2.5, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)

    // High-frequency ringing ("tinnitus") that slowly fades
    const ring = ctx.createOscillator()
    ring.type = 'sine'
    ring.frequency.setValueAtTime(4200, now + 0.05)
    ring.frequency.exponentialRampToValueAtTime(800, now + 2.2)

    const ringGain = ctx.createGain()
    ringGain.gain.setValueAtTime(0.0, now)
    ringGain.gain.linearRampToValueAtTime(0.35, now + 0.06)
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2)

    ring.connect(ringGain)
    ringGain.connect(ctx.destination)
    ring.start(now + 0.04)
    ring.stop(now + 2.2)

    setTimeout(() => ctx.close(), 2500)
  } catch (_) {
    // Web Audio not available — skip silently
  }
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

  const [flashActive, setFlashActive] = useState(false)

  const rainbowRef = useRef(null)
  const rainbowHueRef = useRef(0)

  const stopRainbow = useCallback(() => {
    if (rainbowRef.current) {
      clearInterval(rainbowRef.current)
      rainbowRef.current = null
    }
  }, [])

  const startRainbow = useCallback((currentTheme, currentCustom) => {
    stopRainbow()
    rainbowRef.current = setInterval(() => {
      rainbowHueRef.current = (rainbowHueRef.current + 1.2) % 360
      const h = rainbowHueRef.current
      const [r, g, b] = hslToRgb(h, 90, 50)
      const hex = rgbToHex(r, g, b)
      setPrimaryColor(hex)
      applyThemeStyles(currentTheme, hex, true)
    }, 50)
  }, [stopRainbow])

  useEffect(() => {
    if (!rainbowMode) {
      applyThemeStyles(theme, primaryColor, customThemeEnabled)
    }
    localStorage.setItem('theme', theme)
  }, [theme, primaryColor, customThemeEnabled, rainbowMode])

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
    if (mode === 'light' && theme !== 'light') {
      playFlashbangSound()
      setFlashActive(true)
    }
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

      {/* Flashbang overlay — rendered on top of everything */}
      {flashActive && (
        <div
          onAnimationEnd={() => setFlashActive(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: 'white',
            pointerEvents: 'none',
            animation: 'flashbang 1s ease-out forwards'
          }}
        />
      )}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
