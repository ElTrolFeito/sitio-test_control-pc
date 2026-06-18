export function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s
  const l = (max + min) / 2

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

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Generate full 10-shade palette from a base hex color
// Shades follow Tailwind's lightness ladder: 50 (lightest) → 900 (darkest)
export function generateColorPalette(baseHex) {
  const rgb = hexToRgb(baseHex)
  if (!rgb) return null
  const [h, s] = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // Fixed lightness targets matching Tailwind's blue palette
  const lightnessMap = {
    50: 97, 100: 93, 200: 86, 300: 75,
    400: 64, 500: 53, 600: 43, 700: 34,
    800: 25, 900: 17
  }

  const palette = {}
  Object.entries(lightnessMap).forEach(([shade, targetL]) => {
    // Keep saturation high; slightly reduce for lightest shades
    const adjustedS = Number(shade) < 300 ? Math.max(40, s * 0.7) : Math.min(100, s * 1.05)
    const [r, g, b] = hslToRgb(h, adjustedS, targetL)
    palette[Number(shade)] = rgbToHex(r, g, b)
  })

  return palette
}

// Generate dark-mode palette — inverts lightness so darks become lights
export function generateDarkPalette(lightPalette) {
  return {
    50:  lightPalette[900],
    100: lightPalette[800],
    200: lightPalette[700],
    300: lightPalette[600],
    400: lightPalette[500],
    500: lightPalette[400],
    600: lightPalette[300],
    700: lightPalette[200],
    800: lightPalette[100],
    900: lightPalette[50],
  }
}

// Build CSS that overrides ALL Tailwind primary-color utilities.
// Uses the exact selector format Tailwind v3 emits with darkMode: 'class'.
export function generateThemeCSS(lightPalette, darkPalette) {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  const parts = []

  shades.forEach(n => {
    const lc = lightPalette[n]
    const dc = darkPalette[n]

    // ── background ──────────────────────────────────────────────
    parts.push(`.bg-primary-${n}{background-color:${lc}!important}`)
    parts.push(`.hover\\:bg-primary-${n}:hover{background-color:${lc}!important}`)
    parts.push(`.dark\\:bg-primary-${n}:is(.dark *){background-color:${dc}!important}`)
    parts.push(`.dark\\:hover\\:bg-primary-${n}:is(.dark *):hover{background-color:${dc}!important}`)

    // ── text ─────────────────────────────────────────────────────
    parts.push(`.text-primary-${n}{color:${lc}!important}`)
    parts.push(`.hover\\:text-primary-${n}:hover{color:${lc}!important}`)
    parts.push(`.dark\\:text-primary-${n}:is(.dark *){color:${dc}!important}`)

    // ── border ───────────────────────────────────────────────────
    parts.push(`.border-primary-${n}{border-color:${lc}!important}`)
    parts.push(`.border-t-primary-${n}{border-top-color:${lc}!important}`)
    parts.push(`.dark\\:border-primary-${n}:is(.dark *){border-color:${dc}!important}`)
    parts.push(`.focus\\:border-primary-${n}:focus{border-color:${lc}!important}`)

    // ── ring ─────────────────────────────────────────────────────
    parts.push(`.ring-primary-${n}{--tw-ring-color:${lc}!important}`)
    parts.push(`.focus\\:ring-primary-${n}:focus{--tw-ring-color:${lc}!important}`)
  })

  // opacity variants used in the codebase (bg-primary-900/30, /50, /20)
  const opacityVariants = [
    [900, 20, '20'], [900, 30, '30'], [900, 50, '50'],
    [50, 20, '20'],
  ]
  opacityVariants.forEach(([shade, pct, suffix]) => {
    const lc = lightPalette[shade]
    const dc = darkPalette[shade]
    const lalpha = pct / 100
    const lcRgb = hexToRgb(lc)
    const dcRgb = hexToRgb(dc)
    if (lcRgb && dcRgb) {
      const lcRgba = `rgba(${lcRgb.r},${lcRgb.g},${lcRgb.b},${lalpha})`
      const dcRgba = `rgba(${dcRgb.r},${dcRgb.g},${dcRgb.b},${lalpha})`
      parts.push(`.bg-primary-${shade}\\/${suffix}{background-color:${lcRgba}!important}`)
      parts.push(`.dark\\:bg-primary-${shade}\\/${suffix}:is(.dark *){background-color:${dcRgba}!important}`)
      parts.push(`.hover\\:bg-primary-${shade}\\/${suffix}:hover{background-color:${lcRgba}!important}`)
      parts.push(`.dark\\:hover\\:bg-primary-${shade}\\/${suffix}:is(.dark *):hover{background-color:${dcRgba}!important}`)
    }
  })

  return parts.join('\n')
}

export const DEFAULT_PRIMARY = '#2563eb'

export const PRESET_COLORS = [
  { name: 'Blue',    hex: '#2563eb' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Rose',    hex: '#e11d48' },
  { name: 'Amber',   hex: '#d97706' },
  { name: 'Cyan',    hex: '#0891b2' },
  { name: 'Pink',    hex: '#db2777' },
  { name: 'Lime',    hex: '#65a30d' },
  { name: 'Orange',  hex: '#ea580c' },
]
