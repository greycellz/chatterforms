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
  const [tempValue, setTempValue] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isGradient = value.startsWith('linear-gradient')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Cancel logic inline to avoid dependency issues
        setTempValue(value)
        setMode(value.startsWith('linear-gradient') ? 'gradient' : 'solid')
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, value])

  const handleApply = () => {
    onChange(tempValue)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempValue(value)
    setMode(value.startsWith('linear-gradient') ? 'gradient' : 'solid')
    setIsOpen(false)
  }

  const handleModeChange = (newMode: 'solid' | 'gradient') => {
    setMode(newMode)
    if (newMode === 'solid') {
      setTempValue('#3b82f6')
    } else {
      setTempValue('linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)')
    }
  }

  const updateGradientAngle = (angle: number) => {
    const gradientMatch = tempValue.match(/linear-gradient\(([^,]+),(.+)\)/)
    if (gradientMatch) {
      setTempValue(`linear-gradient(${angle}deg,${gradientMatch[2]})`)
    }
  }

  const updateGradientColor = (colorIndex: number, newColor: string) => {
    // Simplified gradient color update
    if (colorIndex === 0) {
      const updated = tempValue.replace(/#[0-9a-fA-F]{6}/, newColor)
      setTempValue(updated)
    } else {
      const colors = tempValue.match(/#[0-9a-fA-F]{6}/g)
      if (colors && colors.length > 1) {
        const updated = tempValue.replace(colors[1], newColor)
        setTempValue(updated)
      }
    }
  }

  const getCurrentAngle = () => {
    const match = tempValue.match(/linear-gradient\((\d+)deg/)
    return match ? parseInt(match[1]) : 135
  }

  const getGradientColors = () => {
    const colors = tempValue.match(/#[0-9a-fA-F]{6}/g)
    return colors || ['#3b82f6', '#1d4ed8']
  }

  return (
    <div className="relative">
      {/* Color Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors relative overflow-hidden"
          style={{ background: value }}
          title={`${label}: ${isGradient ? 'Gradient' : 'Solid Color'}`}
        >
          {/* Gradient indicator */}
          {isGradient && (
            <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-white rounded-full border border-gray-400">
              <div className="w-1 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full m-0.5"></div>
            </div>
          )}
        </button>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isGradient ? "linear-gradient(...)" : "#000000"}
          className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        />
      </div>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4"
        >
          {/* Mode Toggle */}
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => handleModeChange('solid')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                mode === 'solid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => handleModeChange('gradient')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                mode === 'gradient' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gradient
            </button>
          </div>

          {/* Preview */}
          <div 
            className="w-full h-20 rounded-lg border border-gray-300 mb-4"
            style={{ background: tempValue }}
          />

          {/* Solid Color Controls */}
          {mode === 'solid' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Gradient Controls */}
          {mode === 'gradient' && (
            <div className="space-y-4">
              {/* Angle Control */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
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
                <label className="block text-xs font-medium text-gray-600 mb-2">Colors:</label>
                <div className="flex space-x-2">
                  {getGradientColors().slice(0, 2).map((color, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateGradientColor(index, e.target.value)}
                        className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateGradientColor(index, e.target.value)}
                        className="w-20 text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CSS Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CSS:</label>
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 h-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}