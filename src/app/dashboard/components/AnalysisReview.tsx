import { useState } from 'react'

interface FieldExtraction {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'checkbox-group' | 'radio-with-other' | 'checkbox-with-other'
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
  pageNumber?: number
}

interface AnalysisReviewProps {
  uploadedImage: string | null
  uploadedPDF: File | null
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onAnalyzeImage: (additionalContext?: string) => void
  onAnalyzePDF: (file: File, additionalContext?: string) => void
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
}

export default function AnalysisReview({
  uploadedImage,
  uploadedPDF,
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onAnalyzeImage,
  onAnalyzePDF,
  onFieldsValidated,
  onResetAnalysis
}: AnalysisReviewProps) {
  const [additionalContext, setAdditionalContext] = useState('')

  const fileType = uploadedPDF ? 'PDF' : 'Image'
  const fileName = uploadedPDF?.name || 'screenshot'

  // Don't render anything if no upload workflow is active
  if (!uploadedImage && !uploadedPDF && !analysisComplete) {
    return null
  }

  // Analysis in progress
  if (isAnalyzing) {
    return (
      <div className="p-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-lg animate-pulse">
              {uploadedPDF ? '📄' : '🔍'}
            </span>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-purple-700 font-medium">
                  {uploadedPDF 
                    ? `Analyzing PDF document (${fileName})...`
                    : 'Analyzing screenshot and extracting form fields...'
                  }
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              <div className="mt-1 text-xs text-purple-600">
                {uploadedPDF 
                  ? 'AI is processing PDF text and identifying form structure...'
                  : 'AI is reading your image and identifying form fields...'
                }
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-purple-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-400 rounded-full animate-pulse"
              style={{
                width: '60%',
                animation: 'progress 2s ease-in-out infinite'
              }}
            ></div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; opacity: 0.8; }
            50% { width: 80%; opacity: 1; }
            100% { width: 100%; opacity: 0.8; }
          }
        `}</style>
      </div>
    )
  }

  // Upload context input (before analysis)
  if ((uploadedImage || uploadedPDF) && !analysisComplete && !isAnalyzing) {
    return (
      <div className="p-4 space-y-4 border-t border-gray-200">
        {/* File preview */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              uploadedPDF ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              {uploadedPDF ? (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {fileType} ready for analysis
              </div>
              <div className="text-xs text-gray-500">
                {uploadedPDF ? fileName : 'Screenshot uploaded'}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional context (optional):
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder={uploadedPDF 
              ? "e.g., This is a medical intake form, focus on patient information section..."
              : "e.g., This is a medical intake form, make phone required..."
            }
            className="w-full h-20 p-3 text-sm bg-white text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
          />
          
          <button
            onClick={() => {
              if (uploadedPDF) {
                onAnalyzePDF(uploadedPDF, additionalContext)
              } else {
                onAnalyzeImage(additionalContext)
              }
            }}
            disabled={isAnalyzing}
            className="w-full mt-3 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
          >
            {uploadedPDF ? '📄 Analyze PDF' : '🔍 Analyze Image'}
          </button>
        </div>
      </div>
    )
  }

  // Analysis complete - show field review
  if (analysisComplete && extractedFields.length > 0) {
    return (
      <div className="p-4 space-y-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            {uploadedPDF ? '📄' : '🔍'} Analysis Complete
          </h3>
          <button
            onClick={onResetAnalysis}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Start Over
          </button>
        </div>

        {/* File info */}
        <div className="text-center bg-white p-3 rounded-lg border border-gray-200">
          {uploadedPDF ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{fileName}</p>
                <p className="text-xs text-gray-500">
                  Text analysis • Fields detected
                </p>
              </div>
            </div>
          ) : uploadedImage && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImage}
                alt="Analyzed screenshot"
                className="max-w-full max-h-32 mx-auto rounded border-2 border-gray-300 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Analyzed screenshot</p>
            </div>
          )}
        </div>

        {/* Enhanced field list */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            📋 Extracted Fields ({extractedFields.length})
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {extractedFields.map((field) => (
              <div key={field.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="font-medium">• {field.label}</span>
                    <span className="text-gray-500"> ({field.type})</span>
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.allowOther && <span className="text-blue-500 ml-1">+ Other</span>}
                  </div>
                  
                  {/* Confidence indicator */}
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    field.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                    field.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {field.confidence >= 0.8 ? '✓' : 
                     field.confidence >= 0.6 ? '⚠' : '?'}
                    {Math.round(field.confidence * 100)}%
                  </div>
                </div>
                
                {field.options && (
                  <div className="text-xs text-gray-400 mt-1 ml-4">
                    Options: {field.options.slice(0, 3).join(', ')}
                    {field.options.length > 3 && ` +${field.options.length - 3} more`}
                  </div>
                )}
                
                {field.placeholder && (
                  <div className="text-xs text-gray-400 mt-1 ml-4">
                    Placeholder: {field.placeholder}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => onFieldsValidated(extractedFields)}
            className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
          >
            ✅ Generate Form ({extractedFields.length} fields)
          </button>
        </div>

        {/* PDF-specific tips */}
        {uploadedPDF && (
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-blue-700 mb-1">PDF Analysis Tips:</p>
                <ul className="space-y-1 text-blue-600">
                  <li>• Fields extracted from PDF text structure</li>
                  <li>• Review field types and labels before generating</li>
                  <li>• Low confidence fields may need manual adjustment</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // No fields found
  if (analysisComplete && extractedFields.length === 0) {
    return (
      <div className="p-4 space-y-4 border-t border-gray-200">
        <div className="text-center bg-white p-6 rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No form fields detected</h3>
          <p className="text-xs text-gray-500 mb-4">
            {uploadedPDF 
              ? 'The PDF may not contain recognizable form fields or the structure may be unclear.'
              : 'The image may not show clear form fields or labels.'
            }
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onResetAnalysis}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Try Different File
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}