import { useRef, useState } from 'react'

interface FileUploadProps {
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  uploadedImage: string | null
  uploadedPDF: File | null
  analysisComplete: boolean
}

export default function FileUpload({ 
  onImageUpload, 
  onPDFUpload,
  uploadedImage,
  uploadedPDF, 
  analysisComplete 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)

  // Don't show upload if we already have a file or analysis is complete
  if ((uploadedImage || uploadedPDF) || analysisComplete) {
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

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center transition-colors group"
            title="Attach file"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Attachment Menu */}
          {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg py-2 min-w-max z-50">
              <button
                onClick={() => triggerFileInput('image/*')}
                className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Attach Form Screenshot</span>
              </button>
              <button
                onClick={() => triggerFileInput('application/pdf')}
                className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">Attach PDF to Convert</span>
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
            Upload images or documents to instantly convert to forms 🎉
          </p>
        </div>
      </div>
    </div>
  )
}