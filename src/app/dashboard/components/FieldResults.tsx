import { FieldExtraction } from '../types'

interface FieldResultsProps {
  extractedFields: FieldExtraction[]
  uploadedImage: string | null
  uploadedPDF: File | null
  uploadedURL: string | null // Add URL prop
  fileName: string
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
}

export default function FieldResults({
  extractedFields,
  uploadedImage,
  uploadedPDF,
  uploadedURL, // Add URL prop
  fileName,
  onFieldsValidated,
  onResetAnalysis
}: FieldResultsProps) {
  // Analysis complete with results
  if (extractedFields.length > 0) {
    return (
      <div className="p-4 space-y-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            {uploadedPDF ? '📄' : uploadedURL ? '🔗' : '🔍'} Analysis Complete
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
                  Vision analysis • Fields detected
                </p>
              </div>
            </div>
          ) : uploadedURL ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-48">{fileName}</p>
                <p className="text-xs text-gray-500">
                  URL analysis • Fields detected
                </p>
              </div>
            </div>
          ) : uploadedImage && (
            <div>
              <img
                src={uploadedImage}
                alt="Analyzed screenshot"
                className="max-w-full max-h-32 mx-auto rounded border-2 border-gray-300 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Analyzed screenshot</p>
            </div>
          )}
        </div>

        {/* Enhanced field list with page numbers */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            📋 Extracted Fields ({extractedFields.length})
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {extractedFields.map((field) => (
              <div key={field.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`${
                        field.confidence >= 0.8 ? 'text-green-600' :
                        field.confidence >= 0.6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {field.confidence >= 0.8 ? '✅' : 
                         field.confidence >= 0.6 ? '⚠️' : '❓'}
                      </span>
                      <span className="font-medium">• {field.label}</span>
                      <span className="text-gray-500">({field.type})</span>
                      {field.required && <span className="text-red-500">*</span>}
                      {field.allowOther && <span className="text-blue-500">+ Other</span>}
                      {field.pageNumber && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                          p.{field.pageNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Confidence indicator */}
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    field.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                    field.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {Math.round(field.confidence * 100)}%
                  </div>
                </div>
                
                {field.options && (
                  <div className="text-xs text-gray-400 mt-1 ml-6">
                    Options: {field.options.slice(0, 3).join(', ')}
                    {field.options.length > 3 && ` +${field.options.length - 3} more`}
                  </div>
                )}
                
                {field.placeholder && (
                  <div className="text-xs text-gray-400 mt-1 ml-6">
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

        {/* Enhanced tips based on source */}
        {(uploadedPDF || uploadedURL) && (
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-blue-700 mb-1">
                  {uploadedPDF ? 'PDF Analysis Tips:' : 'URL Analysis Tips:'}
                </p>
                <ul className="space-y-1 text-blue-600">
                  {uploadedPDF ? (
                    <>
                      <li>• Fields extracted using AI vision analysis</li>
                      <li>• Page numbers are preserved for multi-page forms</li>
                      <li>• Review field types and labels before generating</li>
                      <li>• Low confidence fields may need manual adjustment</li>
                    </>
                  ) : (
                    <>
                      <li>• Fields extracted from live web form</li>
                      <li>• Single-screen analysis (no multi-step forms yet)</li>
                      <li>• Review field types and options before generating</li>
                      <li>• Confidence shows accuracy of field detection</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // No fields found
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
            ? 'The PDF may not contain recognizable form fields or the selected pages may not have clear form structure.'
            : uploadedURL
              ? 'The URL may not contain a recognizable form, may be behind authentication, or use complex JavaScript.'
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