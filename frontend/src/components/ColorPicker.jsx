import { useState, useRef, useCallback, useEffect } from 'react'
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, PRESET_COLORS } from '../utils/colors'

export default function ColorPicker({ color, onChange }) {
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const wheelRef = useRef(null)
  const isDragging = useRef(false)

  // Initialize from color prop
  useEffect(() => {
    const rgb = hexToRgb(color)
    if (rgb) {
      const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setHue(h)
      setSaturation(s)
      setLightness(l)
    }
  }, [color])

  // Update color when HSL changes
  const updateColor = useCallback((h, s, l) => {
    const [r, g, b] = hslToRgb(h, s, l)
    onChange(rgbToHex(r, g, b))
  }, [onChange])

  const handleWheelClick = useCallback((e) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    const angle = Math.atan2(y, x) * (180 / Math.PI)
    const h = (angle + 360) % 360
    const distance = Math.min(Math.sqrt(x * x + y * y) / (centerX), 1)
    const s = Math.round(distance * 100)
    const l = 50

    setHue(h)
    setSaturation(s)
    setLightness(l)
    updateColor(h, s, l)
  }, [updateColor])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    handleWheelClick(e)
  }, [handleWheelClick])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handlePresetClick = (hex) => {
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

  // Calculate marker position on wheel
  const wheelSize = 140
  const markerX = Math.cos(hue * Math.PI / 180) * (saturation / 100) * (wheelSize / 2 - 10)
  const markerY = Math.sin(hue * Math.PI / 180) * (saturation / 100) * (wheelSize / 2 - 10)

  return (
    <div className="space-y-4">
      {/* Color Wheel */}
      <div className="flex items-center gap-4">
        <div
          ref={wheelRef}
          className="relative w-[140px] h-[140px] rounded-full cursor-crosshair flex-shrink-0"
          style={{
            background: `conic-gradient(from 0deg,
              hsl(0, 100%, 50%),
              hsl(60, 100%, 50%),
              hsl(120, 100%, 50%),
              hsl(180, 100%, 50%),
              hsl(240, 100%, 50%),
              hsl(300, 100%, 50%),
              hsl(360, 100%, 50%)
            )`
          }}
          onMouseDown={(e) => {
            isDragging.current = true
            handleWheelClick(e)
          }}
        >
          {/* Center white to show saturation */}
          <div className="absolute inset-[30px] rounded-full bg-white dark:bg-slate-900" />
          {/* Marker */}
          <div
            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg pointer-events-none"
            style={{
              left: `calc(50% + ${markerX}px - 10px)`,
              top: `calc(50% + ${markerY}px - 10px)`,
              backgroundColor: color
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-600 shadow-inner"
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
              Brillo: {lightness}%
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={lightness}
              onChange={handleLightnessChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #000, hsl(${hue}, ${saturation}%, 50%), #fff)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Preset Colors */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.hex}
              onClick={() => handlePresetClick(preset.hex)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${color === preset.hex
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-current'
                  : 'hover:scale-105'
                }`}
              style={{
                backgroundColor: preset.hex + '20',
                color: preset.hex
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: preset.hex }}
              />
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
