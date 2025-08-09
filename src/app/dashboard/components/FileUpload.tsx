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

  const handleAttachClick = () => {
    triggerFileInput('image/*,.pdf')
  }

  // URL Input Modal/Popup
  if (showURLInput) {
    return (
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0
            }}>
              🔗 Enter Form URL
            </h3>
            <button
              onClick={() => {
                setShowURLInput(false)
                setUrlValue('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Cancel
            </button>
          </div>
          
          <div className="input-card">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyPress={handleURLKeyPress}
              placeholder="https://forms.google.com/d/xyz... or https://typeform.com/..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#1f2937',
                fontSize: '16px',
                fontFamily: 'inherit',
                padding: 0
              }}
              autoFocus
            />
          </div>
          
          <button
            onClick={handleURLSubmit}
            disabled={!urlValue.trim()}
            className="dashboard-btn primary"
            style={{ width: '100%' }}
          >
            <div className="button-content">
              Analyze Form URL
            </div>
          </button>
          
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Supported platforms:</div>
            <div>Google Forms, Typeform, Microsoft Forms, JotForm, and most public web forms</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Landing page style upload card */}
      <div className="upload-card" onClick={handleAttachClick}>
        <button 
          type="button"
          className="upload-icon"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
          </svg>
        </button>
        
        <div className="upload-text">
          Upload images, documents, or share URLs to instantly convert to forms 🎉
        </div>
        
        {/* Hidden file input */}
        <input 
          ref={fileInputRef}
          type="file" 
          style={{ display: 'none' }}
          accept="image/*,.pdf" 
          onChange={handleFileInputChange}
        />
      </div>

      {/* Upload hints below the card */}
      <div className="upload-hints">
        <div className="upload-hints-text">
          Click above to upload screenshots, PDFs, or{' '}
          <button
            onClick={() => setShowURLInput(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
          >
            analyze form URLs
          </button>
        </div>
      </div>
    </>
  )
}