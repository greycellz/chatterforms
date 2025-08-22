import { useState, useRef, useEffect } from 'react'

interface UnifiedColorPickerProps {
  value: string
  onChange: (value: string) => void
  label: string
}

export default function UnifiedColorPicker({ value, onChange, label }: UnifiedColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'solid' | 'gradient'>(
    value.startsWith('linear-gradient') ? 'gradient' : 'solid'
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isGradient = value.startsWith('linear-gradient')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Apply changes immediately
  const handleColorChange = (newValue: string) => {
    onChange(newValue)
  }

  const handleModeChange = (newMode: 'solid' | 'gradient') => {
    setMode(newMode)
    if (newMode === 'solid') {
      handleColorChange('#3b82f6')
    } else {
      handleColorChange('linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)')
    }
  }

  const updateGradientAngle = (angle: number) => {
    const gradientMatch = value.match(/linear-gradient\(([^,]+),(.+)\)/)
    if (gradientMatch) {
      const newGradient = `linear-gradient(${angle}deg,${gradientMatch[2]})`
      handleColorChange(newGradient)
    }
  }

  const updateGradientColor = (colorIndex: number, newColor: string) => {
    if (colorIndex === 0) {
      const updated = value.replace(/#[0-9a-fA-F]{6}/, newColor)
      handleColorChange(updated)
    } else {
      const colors = value.match(/#[0-9a-fA-F]{6}/g)
      if (colors && colors.length > 1) {
        const updated = value.replace(colors[1], newColor)
        handleColorChange(updated)
      }
    }
  }

  const getCurrentAngle = () => {
    const match = value.match(/linear-gradient\((\d+)deg/)
    return match ? parseInt(match[1]) : 135
  }

  const getGradientColors = () => {
    const colors = value.match(/#[0-9a-fA-F]{6}/g)
    return colors || ['#3b82f6', '#1d4ed8']
  }

  // Quick preset colors for immediate selection
  const quickColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
    '#6b7280', '#1f2937', '#ffffff', '#000000', '#f3f4f6', '#e5e7eb'
  ]

  return (
    <div className="relative">
      {/* Color Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors relative overflow-hidden shadow-sm"
          style={{ background: value }}
          title={`${label}: ${isGradient ? 'Gradient' : 'Solid Color'}`}
        >
          {/* Gradient indicator */}
          {isGradient && (
            <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full border border-gray-400 shadow-sm">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full m-0.5"></div>
            </div>
          )}
        </button>
        
        <input
          type="text"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          placeholder={isGradient ? "linear-gradient(...)" : "#000000"}
          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        />
      </div>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-xl shadow-xl z-50 p-4"
        >
          {/* Mode Toggle */}
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => handleModeChange('solid')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                mode === 'solid' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => handleModeChange('gradient')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                mode === 'gradient' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gradient
            </button>
          </div>

          {/* Preview */}
          <div 
            className="w-full h-16 rounded-lg border border-gray-300 mb-4 shadow-inner"
            style={{ background: value }}
          />

          {/* Solid Color Controls */}
          {mode === 'solid' && (
            <div className="space-y-4">
              {/* Quick Color Presets */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Quick Colors</label>
                <div className="grid grid-cols-6 gap-2">
                  {quickColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                        value === color ? 'border-blue-500 shadow-md' : 'border-gray-300 hover:border-blue-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}

          {/* Gradient Controls */}
          {mode === 'gradient' && (
            <div className="space-y-4">
              {/* Angle Control */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Angle: {getCurrentAngle()}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={getCurrentAngle()}
                  onChange={(e) => updateGradientAngle(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Color Stops */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Colors</label>
                <div className="flex space-x-3">
                  {getGradientColors().slice(0, 2).map((color, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateGradientColor(index, e.target.value)}
                        className="w-8 h-8 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateGradientColor(index, e.target.value)}
                        className="w-20 text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CSS Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">CSS</label>
                <textarea
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 h-16 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                />
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="flex justify-end pt-3 border-t border-gray-200 mt-4">
            <button
              onClick={() => {
                const defaultColor = mode === 'solid' ? '#3b82f6' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                handleColorChange(defaultColor)
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  )
}