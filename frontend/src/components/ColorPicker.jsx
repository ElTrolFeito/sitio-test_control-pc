import { useState, useRef, useCallback, useEffect } from 'react'
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, PRESET_COLORS } from '../utils/colors'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ColorPicker({ color, onChange }) {
  const { rainbowMode, enableRainbow } = useTheme()
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const wheelRef = useRef(null)
  const isDragging = useRef(false)

  // Sync internal HSL state when color prop changes externally (e.g. rainbow animation)
  useEffect(() => {
    const rgb = hexToRgb(color)
    if (rgb) {
      const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setHue(h)
      setSaturation(s)
      setLightness(l)
    }
  }, [color])

  const updateColor = useCallback((h, s, l) => {
    const [r, g, b] = hslToRgb(h, s, l)
    onChange(rgbToHex(r, g, b))
  }, [onChange])

  const handleWheelInteraction = useCallback((e) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY
    const radius = centerX

    // atan2 gives angle from East (3 o'clock = 0°).
    // CSS conic-gradient starts at Top (12 o'clock = 0°) and goes clockwise.
    // So we add 90° to convert atan2 angle → CSS hue angle.
    const atan = Math.atan2(y, x) * (180 / Math.PI)
    const h = (atan + 90 + 360) % 360

    const dist = Math.sqrt(x * x + y * y)
    const s = Math.min(Math.round((dist / radius) * 100), 100)
    const l = lightness

    setHue(h)
    setSaturation(s)
    updateColor(h, s, l)
  }, [updateColor, lightness])

  useEffect(() => {
    const onMove = (e) => { if (isDragging.current) handleWheelInteraction(e) }
    const onUp = () => { isDragging.current = false }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [handleWheelInteraction])

  const handlePresetClick = (hex) => {
    if (rainbowMode) enableRainbow(false)
    const rgb = hexToRgb(hex)
    if (rgb) {
      const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setHue(h)
      setSaturation(s)
      setLightness(l)
      onChange(hex)
    }
  }

  const handleLightnessChange = (e) => {
    const l = parseInt(e.target.value)
    setLightness(l)
    updateColor(hue, saturation, l)
  }

  // Marker position: hue=0 (Red) sits at Top (12 o'clock), so we subtract 90°
  // to convert from CSS gradient angle space → screen coordinate angle.
  const wheelRadius = 60 // (wheelSize/2) - 10 = 70 - 10
  const markerAngleRad = (hue - 90) * (Math.PI / 180)
  const markerX = Math.cos(markerAngleRad) * (saturation / 100) * wheelRadius
  const markerY = Math.sin(markerAngleRad) * (saturation / 100) * wheelRadius

  return (
    <div className="space-y-4">
      {/* Color Wheel */}
      <div className="flex items-center gap-4">
        <div
          ref={wheelRef}
          className="relative w-[140px] h-[140px] rounded-full cursor-crosshair flex-shrink-0 select-none"
          style={{
            background: `conic-gradient(from 0deg,
              hsl(0,100%,50%),
              hsl(60,100%,50%),
              hsl(120,100%,50%),
              hsl(180,100%,50%),
              hsl(240,100%,50%),
              hsl(300,100%,50%),
              hsl(360,100%,50%)
            )`
          }}
          onMouseDown={(e) => {
            isDragging.current = true
            if (rainbowMode) enableRainbow(false)
            handleWheelInteraction(e)
          }}
        >
          {/* Radial gradient overlay: white center → transparent edge (shows saturation) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
          />
          {/* Marker */}
          <div
            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg pointer-events-none"
            style={{
              left: `calc(50% + ${markerX}px - 10px)`,
              top: `calc(50% + ${markerY}px - 10px)`,
              backgroundColor: rainbowMode ? color : color,
              boxShadow: rainbowMode ? `0 0 0 2px ${color}` : undefined
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-600 shadow-inner transition-colors"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Color Hex
              </label>
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => {
                  const hex = e.target.value
                  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                    if (rainbowMode) enableRainbow(false)
                    const rgb = hexToRgb(hex)
                    if (rgb) {
                      const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)
                      setHue(h)
                      setSaturation(s)
                      setLightness(l)
                      onChange(hex)
                    }
                  }
                }}
                className="w-full px-3 py-1.5 text-sm font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Lightness Slider */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Brillo: {Math.round(lightness)}%
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={Math.round(lightness)}
              onChange={handleLightnessChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #000, hsl(${Math.round(hue)},${Math.round(saturation)}%,50%), #fff)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {/* Rainbow button */}
          <button
            onClick={() => enableRainbow(!rainbowMode)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
              rainbowMode ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-pink-400' : 'hover:scale-105'
            }`}
            style={{
              background: 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)'
            }}
          >
            {rainbowMode ? '✦ Rainbow' : '✦ Rainbow'}
          </button>

          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.hex}
              onClick={() => handlePresetClick(preset.hex)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                !rainbowMode && color.toLowerCase() === preset.hex.toLowerCase()
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: preset.hex + '20', color: preset.hex }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.hex }} />
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
