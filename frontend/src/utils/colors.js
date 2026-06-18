// Convert HSL to RGB
export function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

// Convert RGB to HSL
export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

// Convert hex to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Convert RGB to hex
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Generate a full color palette from a base color (hex)
export function generateColorPalette(baseHex) {
  const rgb = hexToRgb(baseHex)
  if (!rgb) return null

  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const palette = {}
  const stops = [
    [50, 95],
    [100, 90],
    [200, 80],
    [300, 70],
    [400, 60],
    [500, 50],
    [600, 40],
    [700, 30],
    [800, 20],
    [900, 10]
  ]

  stops.forEach(([shade, lightness]) => {
    const adjustedL = Math.min(95, Math.max(5, l + (lightness - 50) * 0.9))
    const adjustedS = shade < 400 ? Math.max(50, s - 10) : Math.min(100, s + 5)
    const [r, g, b] = hslToRgb(h, adjustedS, adjustedL)
    palette[shade] = rgbToHex(r, g, b)
  })

  return palette
}

// Generate dark theme colors from a palette
export function generateDarkPalette(lightPalette) {
  const darkPalette = {}
  darkPalette[50] = lightPalette[900]
  darkPalette[100] = lightPalette[800]
  darkPalette[200] = lightPalette[700]
  darkPalette[300] = lightPalette[600]
  darkPalette[400] = lightPalette[500]
  darkPalette[500] = lightPalette[400]
  darkPalette[600] = lightPalette[300]
  darkPalette[700] = lightPalette[200]
  darkPalette[800] = lightPalette[100]
  darkPalette[900] = lightPalette[50]
  return darkPalette
}

// Generate CSS variables from palette
export function paletteToCSSVars(palette, prefix = '--primary') {
  const vars = {}
  Object.entries(palette).forEach(([shade, color]) => {
    vars[`${prefix}-${shade}`] = color
  })
  return vars
}

// Default blue color
export const DEFAULT_PRIMARY = '#2563eb'

// Preset colors for quick selection
export const PRESET_COLORS = [
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Cyan', hex: '#0891b2' },
  { name: 'Pink', hex: '#db2777' },
  { name: 'Lime', hex: '#65a30d' },
]
