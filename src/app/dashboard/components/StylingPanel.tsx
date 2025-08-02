import UnifiedColorPicker from './UnifiedColorPicker'

export type SizeType = 'xs' | 's' | 'm' | 'l' | 'xl'

export interface StylingConfig {
  fontFamily: string
  fontColor: string
  backgroundColor: string
  buttonColor: string
}

export interface SizeConfig {
  globalFontSize: SizeType
  fieldSizes: Record<string, SizeType>
}

interface StylingPanelProps {
  fontFamily: string
  fontColor: string
  backgroundColor: string
  buttonColor: string
  globalFontSize: SizeType
  onFontFamilyChange: (fontFamily: string) => void
  onFontColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
  onButtonColorChange: (color: string) => void
  onSizeChange: (fieldId: string | 'global', size: SizeType) => void
}

export default function StylingPanel({
  fontFamily,
  fontColor,
  backgroundColor,
  buttonColor,
  globalFontSize,
  onFontFamilyChange,
  onFontColorChange,
  onBackgroundColorChange,
  onButtonColorChange,
  onSizeChange
}: StylingPanelProps) {
  const webSafeFonts = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
    { value: '"Courier New", Courier, monospace', label: 'Courier New' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
    { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
    { value: '"Lucida Console", Monaco, monospace', label: 'Lucida Console' },
    { value: 'Impact, Charcoal, sans-serif', label: 'Impact' },
    { value: '"Comic Sans MS", cursive', label: 'Comic Sans MS' }
  ]

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Box: Global Font Settings */}
      <div className="border-2 border-gray-800 rounded-lg p-4 bg-white">
        <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Global Font Settings
        </h3>
        
        <div className="space-y-4">
          {/* Choose Font */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Choose Font:</label>
            <select
              value={fontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              {webSafeFonts.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Choose Size */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Choose Size:</label>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">xs</span>
              <input
                type="range"
                min="0"
                max="4"
                value={['xs', 's', 'm', 'l', 'xl'].indexOf(globalFontSize)}
                onChange={(e) => {
                  const sizes: SizeType[] = ['xs', 's', 'm', 'l', 'xl']
                  onSizeChange('global', sizes[parseInt(e.target.value)])
                }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-400">xl</span>
              <span className="text-xs font-medium text-blue-600 min-w-max">
                {globalFontSize.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Choose Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Choose Color:</label>
            <UnifiedColorPicker
              value={fontColor}
              onChange={onFontColorChange}
              label="Font Color"
            />
          </div>
        </div>
      </div>

      {/* Right Box: Global Color Settings */}
      <div className="border-2 border-gray-800 rounded-lg p-4 bg-white">
        <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Global Color Settings
        </h3>
        
        <div className="space-y-4">
          {/* Choose Background Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Choose Background Color:</label>
            <UnifiedColorPicker
              value={backgroundColor}
              onChange={onBackgroundColorChange}
              label="Background Color"
            />
          </div>

          {/* Choose Button Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Choose Button Color:</label>
            <UnifiedColorPicker
              value={buttonColor}
              onChange={onButtonColorChange}
              label="Button Color"
            />
          </div>
        </div>
      </div>
    </div>
  )
}