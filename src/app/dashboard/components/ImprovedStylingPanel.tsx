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
  onSizeChange
}: ImprovedStylingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('style')
  const panelRef = useRef<HTMLDivElement>(null)

  const webSafeFonts = [
    { value: 'Inter, sans-serif', label: 'Inter', preview: 'Aa' },
    { value: 'Arial, sans-serif', label: 'Arial', preview: 'Aa' },
    { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica', preview: 'Aa' },
    { value: 'Georgia, serif', label: 'Georgia', preview: 'Aa' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana', preview: 'Aa' },
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
        <div className="absolute top-full right-0 w-96 bg-white/95 backdrop-blur-lg border border-gray-200/60 rounded-2xl shadow-xl overflow-hidden z-50 animate-slideIn">
          {/* Tab Navigation */}
          <div className="border-b border-gray-100/80 bg-gray-50/50">
            <div className="flex">
              {[
                { id: 'style', label: 'Style', icon: '🎨' },
                { id: 'themes', label: 'Themes', icon: '✨' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-white/80'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'style' && (
              <div className="space-y-6">
                {/* Typography Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2 border-b border-gray-100 pb-2">
                    <span>📝</span>
                    <span>Typography</span>
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Font Family */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Font Family</label>
                      <div className="grid grid-cols-1 gap-2">
                        {webSafeFonts.map((font) => (
                          <button
                            key={font.value}
                            onClick={() => onFontFamilyChange(font.value)}
                            className={`p-3 border rounded-lg text-left transition-all hover:border-purple-300 ${
                              fontFamily === font.value 
                                ? 'border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium" style={{ fontFamily: font.value }}>
                                {font.label}
                              </span>
                              <span className="text-lg opacity-60" style={{ fontFamily: font.value }}>
                                {font.preview}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Font Size */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Text Size</label>
                      <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                        <span className="text-xs text-gray-400 font-medium">XS</span>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          value={['xs', 's', 'm', 'l', 'xl'].indexOf(globalFontSize)}
                          onChange={(e) => {
                            const sizes: SizeType[] = ['xs', 's', 'm', 'l', 'xl']
                            onSizeChange('global', sizes[parseInt(e.target.value)])
                          }}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((['xs', 's', 'm', 'l', 'xl'].indexOf(globalFontSize)) / 4) * 100}%, #e5e7eb ${((['xs', 's', 'm', 'l', 'xl'].indexOf(globalFontSize)) / 4) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        <span className="text-xs text-gray-400 font-medium">XL</span>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded min-w-[2rem] text-center">
                          {globalFontSize.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colors Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2 border-b border-gray-100 pb-2">
                    <span>🎨</span>
                    <span>Colors</span>
                  </h4>
                  
                  <div className="space-y-3">
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
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-gray-600">{item.label}</label>
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
                
            {activeTab === 'themes' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2 border-b border-gray-100 pb-2">
                  <span>✨</span>
                  <span>Quick Themes</span>
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {presetThemes.map((theme, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => applyTheme(theme)}
                      className="group p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left bg-white/50 hover:bg-purple-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-200" 
                              style={{ backgroundColor: theme.backgroundColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: theme.buttonColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-200" 
                              style={{ backgroundColor: theme.fontColor }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 group-hover:text-purple-700">
                              {theme.name}
                            </div>
                            <div className="text-xs text-gray-500" style={{ fontFamily: theme.fontFamily }}>
                              {theme.description}
                            </div>
                          </div>
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Theme Preview */}
                      <div 
                        className="mt-3 p-3 rounded-lg border transition-all group-hover:shadow-sm"
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
                          className="text-xs px-2 py-1 rounded text-white inline-block"
                          style={{ backgroundColor: theme.buttonColor }}
                        >
                          Submit
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Pro Tip */}
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-purple-800">Pro Tip</p>
                      <p className="text-xs text-purple-700 mt-1">
                        Use the Style tab to create your own custom theme with precise color control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <div className="border-t border-gray-100/80 bg-gray-50/50 px-6 py-3">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Click outside or press ESC to close
            </button>
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
        
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
        }
        
        .range-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  )
}