interface FilePreviewProps {
    fileType: string
    fileName: string
    uploadedPDF: File | null
    additionalContext: string
    onContextChange: (value: string) => void
    onAnalyze: () => void
    isAnalyzing: boolean
  }
  
  export default function FilePreview({
    fileType,
    fileName,
    uploadedPDF,
    additionalContext,
    onContextChange,
    onAnalyze,
    isAnalyzing
  }: FilePreviewProps) {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
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
            onChange={(e) => onContextChange(e.target.value)}
            placeholder={uploadedPDF 
              ? "e.g., This is a medical intake form, focus on patient information section..."
              : "e.g., This is a medical intake form, make phone required..."
            }
            className="w-full h-20 p-3 text-sm bg-white text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
          />
          
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full mt-3 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
          >
            {uploadedPDF ? '📄 Analyze PDF' : '🔍 Analyze Image'}
          </button>
        </div>
      </div>
    )
  }