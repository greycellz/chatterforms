import { useRef, useState } from 'react'

interface FileUploadProps {
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  onURLSubmit: (url: string) => void
  uploadedImage: string | null
  uploadedPDF: File | null
  uploadedURL: string | null
  analysisComplete: boolean
}

export default function FileUpload({ 
  onImageUpload, 
  onPDFUpload,
  onURLSubmit,
  uploadedImage,
  uploadedPDF,
  uploadedURL,
  analysisComplete 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showURLInput, setShowURLInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')

  // Don't show upload if we already have a file/URL or analysis is complete
  if ((uploadedImage || uploadedPDF || uploadedURL) || analysisComplete) {
    return null
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file) return

    if (file.type === 'application/pdf') {
      onPDFUpload(file)
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileData = e.target?.result as string
        onImageUpload(fileData)
      }
      reader.readAsDataURL(file)
    } else {
      alert('Please upload an image (PNG, JPG, GIF) or PDF file.')
      return
    }
    
    setShowAttachMenu(false)
  }

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept
      fileInputRef.current.click()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleURLSubmit = () => {
    if (urlValue.trim()) {
      onURLSubmit(urlValue.trim())
      setUrlValue('')
      setShowURLInput(false)
      setShowAttachMenu(false)
    }
  }

  const handleURLKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleURLSubmit()
    }
  }

  // URL Input Modal/Popup
  if (showURLInput) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">🔗 Enter Form URL</h3>
            <button
              onClick={() => {
                setShowURLInput(false)
                setUrlValue('')
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          
          <div className="space-y-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyPress={handleURLKeyPress}
              placeholder="https://forms.google.com/d/xyz... or https://typeform.com/..."
              className="w-full p-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              autoFocus
            />
            <button
              onClick={handleURLSubmit}
              disabled={!urlValue.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              Analyze Form URL
            </button>
          </div>
          
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <p className="font-medium text-blue-700 mb-1">Supported platforms:</p>
            <p>Google Forms, Typeform, Microsoft Forms, JotForm, and most public web forms</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center transition-colors group"
            title="Attach file or URL"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Enhanced Attachment Menu - Position below and to the right */}
          {showAttachMenu && (
            <div className="absolute top-full left-full ml-2 mt-2 bg-gray-800 rounded-lg shadow-lg py-2 min-w-max z-50">
              {/* Option 1: Screenshot */}
              <button
                onClick={() => {
                  triggerFileInput('image/*')
                  setShowAttachMenu(false)
                }}
                className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Attach Form Screenshot</span>
              </button>
              
              {/* Option 2: PDF */}
              <button
                onClick={() => {
                  triggerFileInput('application/pdf')
                  setShowAttachMenu(false)
                }}
                className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">Attach PDF to Convert</span>
              </button>

              {/* Option 3: URL */}
              <button
                onClick={() => {
                  setShowAttachMenu(false)
                  setShowURLInput(true)
                }}
                className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm">Analyze Form URL</span>
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
        
        {/* Descriptive text */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 leading-tight">
            Upload images, documents, or share URLs to instantly convert to forms 🎉
          </p>
        </div>
      </div>
    </div>
  )
}