interface GradientPickerProps {
    value: string
    onChange: (value: string) => void
    presets: string[]
    type: 'background' | 'button'
  }
  
  export default function GradientPicker({ value, onChange, presets, type }: GradientPickerProps) {
    const isGradient = value.startsWith('linear-gradient')
    
    // Extract colors and direction from gradient string
    const parseGradient = (gradientStr: string) => {
      if (!gradientStr.startsWith('linear-gradient')) return null
      
      const match = gradientStr.match(/linear-gradient\(([^,]+),\s*([^,]+)\s+(\d+%),\s*([^,]+)\s+(\d+%)\)/)
      if (!match) return null
      
      return {
        direction: match[1].trim(),
        color1: match[2].trim(),
        stop1: match[3],
        color2: match[4].trim(),
        stop2: match[5]
      }
    }
  
    const gradientData = parseGradient(value)
    
    const directions = [
      { value: '135deg', label: 'Right top' },
      { value: '90deg', label: 'Right' },
      { value: '45deg', label: 'Right bottom' },
      { value: '0deg', label: 'Bottom' },
      { value: '315deg', label: 'Left bottom' },
      { value: '270deg', label: 'Left' },
      { value: '225deg', label: 'Left top' },
      { value: '180deg', label: 'Top' }
    ]
  
    const updateGradient = (direction?: string, color1?: string, color2?: string, stop1?: string, stop2?: string) => {
      const currentData = gradientData || { 
        direction: '135deg', 
        color1: '#667eea', 
        stop1: '0%', 
        color2: '#764ba2', 
        stop2: '100%' 
      }
      
      const newGradient = `linear-gradient(${direction || currentData.direction}, ${color1 || currentData.color1} ${stop1 || currentData.stop1}, ${color2 || currentData.color2} ${stop2 || currentData.stop2})`
      onChange(newGradient)
    }
  
    if (!isGradient) {
      return (
        <div className="space-y-3">
          {/* Preset Grid */}
          <div className="grid grid-cols-4 gap-2">
            {presets.map((gradient, index) => (
              <button
                key={index}
                onClick={() => onChange(gradient)}
                className="w-8 h-8 rounded border-2 border-gray-300 transition-all hover:scale-105 hover:border-blue-400"
                style={{ background: gradient }}
                title={`${type} Gradient ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Quick Start Button */}
          <button
            onClick={() => onChange(presets[0])}
            className="w-full text-xs text-blue-600 hover:text-blue-800 py-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
          >
            Create Custom Gradient
          </button>
        </div>
      )
    }
  
    return (
      <div className="space-y-4">
        {/* Gradient Preview */}
        <div 
          className="w-full h-16 rounded-lg border-2 border-gray-300"
          style={{ background: value }}
        />
        
        {/* Direction & Colors Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Direction */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Direction:</label>
            <select
              value={gradientData?.direction || '135deg'}
              onChange={(e) => updateGradient(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {directions.map((dir) => (
                <option key={dir.value} value={dir.value}>
                  {dir.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Colors */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Colors:</label>
            <div className="flex space-x-1">
              <input
                type="color"
                value={gradientData?.color1 || '#667eea'}
                onChange={(e) => updateGradient(undefined, e.target.value)}
                className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                title="Start color"
              />
              <input
                type="color"
                value={gradientData?.color2 || '#764ba2'}
                onChange={(e) => updateGradient(undefined, undefined, e.target.value)}
                className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                title="End color"
              />
              <button
                onClick={() => onChange(presets[0])}
                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                title="Add color stop"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        {/* Preset Swatches */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Presets:</label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((gradient, index) => (
              <button
                key={index}
                onClick={() => onChange(gradient)}
                className={`w-8 h-8 rounded border-2 transition-all hover:scale-105 ${
                  value === gradient ? 'border-blue-500 shadow-md' : 'border-gray-300 hover:border-blue-400'
                }`}
                style={{ background: gradient }}
                title={`Preset ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* CSS Output */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">CSS:</label>
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 h-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <button
              onClick={() => navigator.clipboard?.writeText(value)}
              className="absolute top-1 right-1 text-xs px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Copy CSS"
            >
              Copy
            </button>
          </div>
        </div>
        
        {/* Back to Simple Mode */}
        <button
          onClick={() => onChange('#ffffff')}
          className="w-full text-xs text-gray-600 hover:text-gray-800 py-1 border-t border-gray-200 pt-2"
        >
          ← Back to Solid Color
        </button>
      </div>
    )
  }