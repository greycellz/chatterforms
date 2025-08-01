interface SizeSliderProps {
    fieldId?: string
    currentSize: 'xs' | 's' | 'm' | 'l' | 'xl'
    onSizeChange: (fieldId: string | 'global', size: 'xs' | 's' | 'm' | 'l' | 'xl') => void
    isGlobal?: boolean
    label?: string
  }
  
  export default function SizeSlider({ fieldId, currentSize, onSizeChange, isGlobal = false, label }: SizeSliderProps) {
    const sizes: ('xs' | 's' | 'm' | 'l' | 'xl')[] = ['xs', 's', 'm', 'l', 'xl']
    const currentIndex = sizes.indexOf(currentSize)
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newIndex = parseInt(e.target.value)
      const newSize = sizes[newIndex]
      onSizeChange(fieldId || 'global', newSize)
    }
  
    return (
      <div className={`flex items-center space-x-2 ${isGlobal ? 'mb-4' : 'mb-2'}`}>
        {label && (
          <span className="text-xs font-medium text-gray-600 min-w-max">
            {label}:
          </span>
        )}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">xs</span>
          <input
            type="range"
            min="0"
            max="4"
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentIndex / 4) * 100}%, #e5e7eb ${(currentIndex / 4) * 100}%, #e5e7eb 100%)`
            }}
          />
          <span className="text-xs text-gray-400">xl</span>
          <span className="text-xs font-medium text-blue-600 min-w-max">
            {currentSize.toUpperCase()}
          </span>
        </div>
        
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    )
  }