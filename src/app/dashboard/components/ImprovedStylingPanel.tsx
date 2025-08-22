import { useState, useEffect, useRef } from 'react'
import UnifiedColorPicker from './UnifiedColorPicker'

export type SizeType = 'xs' | 's' | 'm' | 'l' | 'xl'

export interface StylingConfig {
  fontFamily: string
  fontColor: string
  backgroundColor: string
  buttonColor: string
}

interface ImprovedStylingPanelProps {
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
  onPanelToggle?: (isOpen: boolean) => void
}

export default function ImprovedStylingPanel({
  fontFamily,
  fontColor,
  backgroundColor,
  buttonColor,
  globalFontSize,
  onFontFamilyChange,
  onFontColorChange,
  onBackgroundColorChange,
  onButtonColorChange,
  onSizeChange,
  onPanelToggle
}: ImprovedStylingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('quick')
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Notify parent when panel state changes
  useEffect(() => {
    onPanelToggle?.(isExpanded)
  }, [isExpanded, onPanelToggle])

  const webSafeFonts = [
    { value: 'Inter, sans-serif', label: 'Inter', category: 'Modern' },
    { value: 'Arial, sans-serif', label: 'Arial', category: 'Classic' },
    { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica', category: 'Classic' },
    { value: 'Georgia, serif', label: 'Georgia', category: 'Elegant' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana', category: 'Readable' },
  ]

  // Compact color palettes inspired by the color card design
  const compactColorPalettes = [
    {
      name: 'Professional',
      colors: {
        background: '#ffffff',
        font: '#1f2937',
        button: '#3b82f6'
      },
      description: 'Trustworthy and corporate'
    },
    {
      name: 'Education',
      colors: {
        background: '#f0fdf4',
        font: '#064e3b',
        button: '#059669'
      },
      description: 'Calm and educational'
    },
    {
      name: 'Healthcare',
      colors: {
        background: '#f0fdfa',
        font: '#0f766e',
        button: '#0d9488'
      },
      description: 'Medical and reliable'
    },
    {
      name: 'Creative',
      colors: {
        background: '#fef3c7',
        font: '#92400e',
        button: '#f59e0b'
      },
      description: 'Warm and approachable'
    },
    {
      name: 'Modern',
      colors: {
        background: '#f8fafc',
        font: '#374151',
        button: '#8b5cf6'
      },
      description: 'Sleek and contemporary'
    },
    {
      name: 'Minimal',
      colors: {
        background: '#ffffff',
        font: '#374151',
        button: '#6b7280'
      },
      description: 'Clean and minimal'
    }
  ]

  const presetThemes = [
    { 
      name: 'Professional', 
      fontFamily: 'Inter, sans-serif',
      fontColor: '#1f2937',
      backgroundColor: '#ffffff',
      buttonColor: '#3b82f6',
      description: 'Clean and trustworthy'
    },
    { 
      name: 'Creative', 
      fontFamily: 'Georgia, serif',
      fontColor: '#92400e',
      backgroundColor: '#fef3c7',
      buttonColor: '#f59e0b',
      description: 'Warm and approachable'
    },
    { 
      name: 'Medical', 
      fontFamily: 'Arial, sans-serif',
      fontColor: '#064e3b',
      backgroundColor: '#ecfdf5',
      buttonColor: '#059669',
      description: 'Calm and reliable'
    },
    { 
      name: 'Modern', 
      fontFamily: 'Inter, sans-serif',
      fontColor: '#374151',
      backgroundColor: '#f8fafc',
      buttonColor: '#8b5cf6',
      description: 'Sleek and contemporary'
    }
  ]

  const applyTheme = (theme: typeof presetThemes[0]) => {
    onFontFamilyChange(theme.fontFamily)
    onFontColorChange(theme.fontColor)
    onBackgroundColorChange(theme.backgroundColor)
    onButtonColorChange(theme.buttonColor)
  }

  const applyColorPalette = (palette: typeof compactColorPalettes[0]) => {
    onFontColorChange(palette.colors.font)
    onBackgroundColorChange(palette.colors.background)
    onButtonColorChange(palette.colors.button)
    setSelectedPalette(palette.name)
  }

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isExpanded])

  return (
    <div className="relative" ref={panelRef}>
      {/* Settings Trigger Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl hover:border-purple-300 hover:bg-purple-50/80 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">Customize</span>
          <svg className={`w-4 h-4 text-gray-500 group-hover:text-purple-500 transition-all duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Settings Panel */}
      {isExpanded && (
        <div className="absolute top-full right-0 w-[450px] border-4 border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 backdrop-blur-sm" style={{ height: '600px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)' }}>
          {/* Tab Navigation - More spacing and better labels */}
                      <div className="border-b border-gray-100 bg-gray-50 px-10 py-4" style={{ padding: '16px 40px' }}>
            <div className="flex justify-between">
              {[
                { id: 'quick', label: 'Quick Start' },
                { id: 'themes', label: 'Great Themes' },
                { id: 'style', label: 'Custom Style' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-base font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-white/80'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content - More margin and better spacing */}
          <div className="px-8 py-4 max-h-[480px] overflow-y-auto" style={{ padding: '16px' }}>
            {/* Quick Start Tab - Compact color palettes */}
            {activeTab === 'quick' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="text-center px-8 py-1" style={{ padding: '4px 24px' }}>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Quick Customization</h3>
                  <p className="text-sm text-gray-600">Choose a color palette that you like</p>
                </div>

                {/* Compact Color Palettes */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2 px-8" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                    <span>🎨</span>
                    <span>Recommended Palettes</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-6 px-8" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                    {compactColorPalettes.map((palette, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => applyColorPalette(palette)}
                        className={`w-full p-6 mx-2 border-2 transition-all duration-200 text-left shadow-sm hover:shadow-md ${
                          selectedPalette === palette.name 
                            ? 'border-purple-600 bg-purple-50/50 shadow-md' 
                            : 'border-gray-400 hover:border-purple-400 bg-white hover:bg-purple-50/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 group-hover:text-purple-700">
                              {palette.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {palette.description}
                            </div>
                          </div>
                          
                          {/* Compact color swatches - rectangular format */}
                          <div className="flex space-x-2 ml-4">
                            <div 
                              className="w-8 h-6 border-2 border-gray-500" 
                              style={{ backgroundColor: palette.colors.background }}
                              title="Background"
                            />
                            <div 
                              className="w-8 h-6 border-2 border-gray-500" 
                              style={{ backgroundColor: palette.colors.font }}
                              title="Font"
                            />
                            <div 
                              className="w-8 h-6 border-2 border-gray-500" 
                              style={{ backgroundColor: palette.colors.button }}
                              title="Button"
                            />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Font Selection */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2 px-8" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                    <span>📝</span>
                    <span>Font Style</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 px-8" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                    {webSafeFonts.slice(0, 4).map((font) => (
                      <button
                        key={font.value}
                        onClick={() => onFontFamilyChange(font.value)}
                        className={`p-4 mx-1 border text-left transition-all hover:border-purple-300 ${
                          fontFamily === font.value 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-sm font-medium" style={{ fontFamily: font.value }}>
                          {font.label}
                        </div>
                        <div className="text-xs text-gray-500">{font.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Great Themes Tab - More margin and better spacing */}
            {activeTab === 'themes' && (
              <div className="space-y-6">
                <div className="text-center px-6 py-1" style={{ padding: '4px 24px' }}>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Beautiful Themes</h3>
                  <p className="text-sm text-gray-600">Choose a theme that you like</p>
                </div>

                <div className="grid grid-cols-1 gap-4 px-6">
                  {presetThemes.map((theme, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => applyTheme(theme)}
                      className="w-full p-5 border-2 border-gray-400 hover:border-purple-400 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-purple-50/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex space-x-2">
                            <div 
                              className="w-6 h-6 border-2 border-gray-500" 
                              style={{ backgroundColor: theme.backgroundColor }}
                            />
                            <div 
                              className="w-6 h-6 border-2 border-gray-500" 
                              style={{ backgroundColor: theme.buttonColor }}
                            />
                            <div 
                              className="w-6 h-6 border-2 border-gray-500" 
                              style={{ backgroundColor: theme.fontColor }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {theme.name}
                            </div>
                            <div className="text-xs text-gray-500" style={{ fontFamily: theme.fontFamily }}>
                              {theme.description}
                            </div>
                          </div>
                        </div>
                        
                        <svg className="w-5 h-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      
                      {/* Theme Preview */}
                      <div 
                        className="p-4 border transition-all group-hover:shadow-sm"
                        style={{ 
                          backgroundColor: theme.backgroundColor,
                          borderColor: theme.buttonColor + '40'
                        }}
                      >
                        <div 
                          className="text-xs font-medium mb-2"
                          style={{ 
                            color: theme.fontColor,
                            fontFamily: theme.fontFamily
                          }}
                        >
                          Sample Form Title
                        </div>
                        <div 
                          className="text-xs mb-2"
                          style={{ 
                            color: theme.fontColor,
                            opacity: 0.8,
                            fontFamily: theme.fontFamily
                          }}
                        >
                          Name: ___________
                        </div>
                        <div 
                          className="text-xs px-2 py-1 text-white inline-block"
                          style={{ backgroundColor: theme.buttonColor }}
                        >
                          Submit
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Style Tab - More margin and better spacing */}
            {activeTab === 'style' && (
              <div className="space-y-6">
                <div className="text-center px-6 py-1" style={{ padding: '4px 24px' }}>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Custom Styling</h3>
                  <p className="text-sm text-gray-600">Customize your form&apos;s appearance</p>
                </div>

                {/* Typography Section - More margin */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 px-6">
                    <span>✏️</span>
                    <span>Typography</span>
                  </h4>
                  
                  <div className="space-y-4 px-6">
                    {/* Font Family */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-600 mb-3">Font Family</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => onFontFamilyChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      >
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Roboto">Roboto (Clean)</option>
                        <option value="Open Sans">Open Sans (Friendly)</option>
                        <option value="Lato">Lato (Professional)</option>
                        <option value="Poppins">Poppins (Contemporary)</option>
                      </select>
                    </div>

                    {/* Text Size */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-600 mb-3">Text Size</label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>XS</span>
                          <span>XL</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          value={['xs', 's', 'm', 'l', 'xl'].indexOf(globalFontSize)}
                          onChange={(e) => {
                            const sizes: SizeType[] = ['xs', 's', 'm', 'l', 'xl']
                            onSizeChange('global', sizes[parseInt(e.target.value)])
                          }}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                        />
                        <div className="flex justify-center">
                          <span className="text-sm font-medium text-blue-600">M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colors Section - Popped up */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 px-6">
                    <span>🎨</span>
                    <span>Colors</span>
                  </h4>
                  
                  <div className="space-y-4 px-6">
                    {[
                      { 
                        label: 'Text Color', 
                        value: fontColor, 
                        onChange: onFontColorChange,
                        desc: 'Form text and labels' 
                      },
                      { 
                        label: 'Background', 
                        value: backgroundColor, 
                        onChange: onBackgroundColorChange,
                        desc: 'Form background' 
                      },
                      { 
                        label: 'Accent Color', 
                        value: buttonColor, 
                        onChange: onButtonColorChange,
                        desc: 'Buttons and highlights' 
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-medium text-gray-600">{item.label}</label>
                          <span className="text-xs text-gray-500">{item.desc}</span>
                        </div>
                        <UnifiedColorPicker
                          value={item.value}
                          onChange={item.onChange}
                          label={item.label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Click outside or press ESC to close</p>
            </div>
          </div>
        </div>
      )}
      

      

    </div>
  )
}