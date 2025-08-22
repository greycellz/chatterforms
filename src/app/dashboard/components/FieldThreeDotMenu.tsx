import { useState, useEffect, useRef } from 'react'
import { SizeType } from '../components/SizeUtilities'

interface FieldThreeDotMenuProps {
  fieldId: string
  fieldType: string
  isRequired: boolean
  currentSize: SizeType
  placeholder?: string
  onToggleRequired: (fieldId: string, required: boolean) => void
  onSizeChange: (fieldId: string, size: SizeType) => void
  onStartEditing: (fieldType: 'placeholder', fieldId: string, fieldIndex: number) => void
  fieldIndex: number
  onDuplicateField?: (fieldId: string) => void
  onDeleteField?: (fieldId: string) => void
  // Editing props
  editingField?: string | null
  editValue?: string
  onEditValueChange?: (value: string) => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
}

export default function FieldThreeDotMenu({
  fieldId,
  fieldType,
  isRequired,
  currentSize,
  placeholder,
  onToggleRequired,
  onSizeChange,
  onStartEditing,
  fieldIndex,
  onDuplicateField,
  onDeleteField,
  editingField,
  editValue,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit
}: FieldThreeDotMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const sizeOptions: { value: SizeType; label: string }[] = [
    { value: 'xs', label: 'Extra Small' },
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
    { value: 'xl', label: 'Extra Large' }
  ]

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseMenu()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close popup when field changes
  useEffect(() => {
    setIsOpen(false)
  }, [fieldId])

  const handleMenuClick = () => {
    setIsOpen(!isOpen)
  }

  const handleCloseMenu = () => {
    setIsOpen(false)
    // Blur the button to remove focus
    if (menuRef.current) {
      const button = menuRef.current.querySelector('button')
      if (button) {
        button.blur()
      }
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Three-Dot Button with Animation */}
      <button
        onClick={handleMenuClick}
        onFocus={(e) => {
          // Prevent popup from reopening on focus unless it was explicitly clicked
          if (!isOpen) {
            e.target.blur()
          }
        }}
        className="p-2.5 text-gray-600 hover:text-blue-600 transition-all duration-300 rounded-full hover:bg-blue-50 hover:shadow-lg three-dot-pulse"
        title="Field settings"
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
        </svg>
      </button>

      <style jsx>{`
        .three-dot-pulse {
          animation: threeDotDance 2.5s ease-in-out infinite;
        }
        
        @keyframes threeDotDance {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: scale(1.15) rotate(2deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1) rotate(-1deg);
            opacity: 1;
          }
          75% {
            transform: scale(1.2) rotate(1deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.6;
          }
        }
        
        .three-dot-pulse:hover {
          animation: threeDotHover 0.3s ease-out forwards;
        }
        
        @keyframes threeDotHover {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1.1);
          }
        }
        
        /* Individual dot animations */
        .three-dot-pulse svg circle:nth-child(1) {
          animation: dotBounce 2s ease-in-out infinite;
          animation-delay: 0s;
        }
        
        .three-dot-pulse svg circle:nth-child(2) {
          animation: dotBounce 2s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        .three-dot-pulse svg circle:nth-child(3) {
          animation: dotBounce 2s ease-in-out infinite;
          animation-delay: 0.4s;
        }
        
        @keyframes dotBounce {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
        }
      `}</style>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-green-50/90 backdrop-blur-md border border-green-200/30 rounded-xl shadow-2xl z-50"
             style={{
               background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(220, 252, 231, 0.95) 100%)',
               boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.1)'
             }}>
          <div className="p-4 space-y-4">
            {/* Required/Optional Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Required Field</span>
              <button
                onClick={() => onToggleRequired(fieldId, !isRequired)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isRequired ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRequired ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Size Settings */}
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">Input Field Size</span>
              <select
                value={currentSize}
                onChange={(e) => onSizeChange(fieldId, e.target.value as SizeType)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {sizeOptions.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Placeholder Editor (for applicable field types) */}
            {(fieldType === 'text' || fieldType === 'email' || fieldType === 'tel' || fieldType === 'textarea') && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Placeholder</span>
                {editingField === `placeholder-${fieldId}` ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => onEditValueChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onSaveEdit()
                          setIsOpen(false)
                        }
                        if (e.key === 'Escape') {
                          onCancelEdit()
                          setIsOpen(false)
                        }
                      }}
                      onBlur={() => {
                        onSaveEdit()
                        setIsOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter placeholder text..."
                      autoFocus
                    />
                    <div className="flex space-x-2 text-xs">
                      <span className="text-gray-500">Press Enter to save, Escape to cancel</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      onStartEditing('placeholder', fieldId, fieldIndex)
                    }}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {placeholder || 'Click to set placeholder...'}
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-2" />

            {/* Actions */}
            <div className="space-y-1">
              {onDuplicateField && (
                <button
                  onClick={() => {
                    onDuplicateField(fieldId)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  📋 Duplicate Field
                </button>
              )}
              {onDeleteField && (
                <button
                  onClick={() => {
                    onDeleteField(fieldId)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  🗑️ Delete Field
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleCloseMenu}
        />
      )}
    </div>
  )
}
