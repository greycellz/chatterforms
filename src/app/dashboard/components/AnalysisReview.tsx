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
}

interface AnalysisReviewProps {
  uploadedImage: string | null
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onAnalyzeImage: (additionalContext?: string) => void
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
}

export default function AnalysisReview({
  uploadedImage,
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onAnalyzeImage,
  onFieldsValidated,
  onResetAnalysis
}: AnalysisReviewProps) {
  const [additionalContext, setAdditionalContext] = useState('')

  // Don't render anything if no upload workflow is active
  if (!uploadedImage && !analysisComplete) {
    return null
  }

  // Analysis in progress
  if (isAnalyzing) {
    return (
      <div className="p-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-lg animate-pulse">🔍</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-purple-700 font-medium">
                  Analyzing screenshot and extracting form fields...
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              <div className="mt-1 text-xs text-purple-600">
                AI is reading your image and identifying form fields...
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
  if (uploadedImage && !analysisComplete && !isAnalyzing) {
    return (
      <div className="p-4 space-y-4 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional context (optional):
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="e.g., This is a medical intake form, make phone required..."
            className="w-full h-20 p-3 text-sm bg-white text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
          />
          
          <button
            onClick={() => onAnalyzeImage(additionalContext)}
            disabled={isAnalyzing}
            className="w-full mt-3 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
          >
            🔍 Analyze File
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
          <h3 className="text-sm font-medium text-gray-700">🔍 Analysis Complete</h3>
          <button
            onClick={onResetAnalysis}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Start Over
          </button>
        </div>

        {/* Screenshot Thumbnail */}
        {uploadedImage && (
          <div className="text-center bg-white p-2 rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Analyzed screenshot"
              className="max-w-full max-h-32 mx-auto rounded border-2 border-gray-300 shadow-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Analyzed screenshot</p>
          </div>
        )}

        {/* Enhanced field list */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📋 Extracted Fields ({extractedFields.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {extractedFields.map((field) => (
              <div key={field.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <span className="font-medium">• {field.label}</span>
                <span className="text-gray-500"> ({field.type})</span>
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.allowOther && <span className="text-blue-500 ml-1">+ Other</span>}
                {field.options && (
                  <div className="text-xs text-gray-400 mt-1 ml-4">
                    Options: {field.options.slice(0, 3).join(', ')}
                    {field.options.length > 3 && ` +${field.options.length - 3} more`}
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
      </div>
    )
  }

  return null
}