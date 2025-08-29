import { useState, useRef, useCallback } from 'react'

interface ModernFileUploadProps {
  label?: string
  required?: boolean
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFileSelect?: (files: File[]) => void
  placeholder?: string
  className?: string
}

export default function ModernFileUpload({
  label = "Upload Files",
  required = false,
  accept = "*/*",
  multiple = false,
  maxSize = 10, // 10MB default
  onFileSelect,
  placeholder = "Drag and drop files here, or click to browse",
  className = ""
}: ModernFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback((files: FileList | File[]): { valid: File[], invalid: string[] } => {
    const validFiles: File[] = []
    const invalidReasons: string[] = []

    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        invalidReasons.push(`${file.name} is too large (max ${maxSize}MB)`)
        return
      }

      // Check file type if accept is specified and not wildcard
      if (accept && accept !== "*/*") {
        const acceptedTypes = accept.split(',').map(type => type.trim())
        const fileType = file.type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
        
        const isAccepted = acceptedTypes.some(type => {
          // Handle file extensions (e.g., .pdf, .jpg)
          if (type.startsWith('.')) {
            return fileExtension === type.toLowerCase()
          }
          // Handle MIME type patterns (e.g., image/*, application/*)
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', ''))
          }
          // Handle exact MIME types (e.g., application/pdf)
          return fileType === type
        })

        if (!isAccepted) {
          invalidReasons.push(`${file.name} is not an accepted file type`)
          return
        }
      }

      validFiles.push(file)
    })

    return { valid: validFiles, invalid: invalidReasons }
  }, [accept, maxSize])

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError("")
    const { valid, invalid } = validateFiles(files)

    if (invalid.length > 0) {
      setError(invalid.join(', '))
      return
    }

    if (multiple) {
      setSelectedFiles(prev => [...prev, ...valid])
      onFileSelect?.([...selectedFiles, ...valid])
    } else {
      setSelectedFiles(valid.slice(0, 1))
      onFileSelect?.(valid.slice(0, 1))
    }
  }, [multiple, selectedFiles, onFileSelect, validateFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect?.(newFiles)
  }, [selectedFiles, onFileSelect])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File): string => {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.includes('pdf')) return '📄'
    if (file.type.includes('document') || file.type.includes('word')) return '📝'
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return '📊'
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return '📈'
    if (file.type.includes('video/')) return '🎥'
    if (file.type.includes('audio/')) return '🎵'
    return '📎'
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Drag & Drop Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Upload Icon */}
        <div className="mb-4">
          <div className={`
            mx-auto w-12 h-12 rounded-full flex items-center justify-center
            ${isDragOver ? 'bg-purple-100' : 'bg-gray-100'}
          `}>
            <svg 
              className={`w-6 h-6 ${isDragOver ? 'text-purple-600' : 'text-gray-400'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className={`text-sm font-medium ${isDragOver ? 'text-purple-600' : 'text-gray-600'}`}>
            {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-gray-500">
            {placeholder}
          </p>
          <p className="text-xs text-gray-400">
            Max size: {maxSize}MB
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFileIcon(file)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
