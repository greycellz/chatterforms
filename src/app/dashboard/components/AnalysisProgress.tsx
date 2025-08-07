interface AnalysisProgressProps {
    uploadedPDF: File | null
    fileName: string
  }
  
  export default function AnalysisProgress({ uploadedPDF, fileName }: AnalysisProgressProps) {
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
                  ? 'Converting PDF to images and analyzing with AI vision...'
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