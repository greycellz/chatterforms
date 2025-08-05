interface LoadingAnimationProps {
    message: string
    subMessage?: string
    icon?: string
    variant?: 'default' | 'form' | 'analysis'
  }
  
  export default function LoadingAnimation({ 
    message, 
    subMessage, 
    icon = "✨", 
    variant = 'default' 
  }: LoadingAnimationProps) {
    return (
      <div className={`p-4 rounded-lg border ${
        variant === 'analysis' ? 'bg-purple-50 border-purple-200' :
        variant === 'form' ? 'bg-blue-50 border-blue-200' :
        'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center space-x-3">
          <span className="text-lg animate-pulse">{icon}</span>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${
                variant === 'analysis' ? 'text-purple-700' :
                variant === 'form' ? 'text-blue-700' :
                'text-blue-700'
              }`}>
                {message}
              </span>
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  variant === 'analysis' ? 'bg-purple-500' :
                  variant === 'form' ? 'bg-blue-500' :
                  'bg-blue-500'
                }`} style={{ animationDelay: '0ms' }}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  variant === 'analysis' ? 'bg-purple-500' :
                  variant === 'form' ? 'bg-blue-500' :
                  'bg-blue-500'
                }`} style={{ animationDelay: '150ms' }}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  variant === 'analysis' ? 'bg-purple-500' :
                  variant === 'form' ? 'bg-blue-500' :
                  'bg-blue-500'
                }`} style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            {subMessage && (
              <div className={`mt-1 text-xs ${
                variant === 'analysis' ? 'text-purple-600' :
                variant === 'form' ? 'text-blue-600' :
                'text-blue-600'
              }`}>
                {subMessage}
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar animation */}
        <div className={`mt-3 h-1 rounded-full overflow-hidden ${
          variant === 'analysis' ? 'bg-purple-100' :
          variant === 'form' ? 'bg-blue-100' :
          'bg-blue-100'
        }`}>
          <div 
            className={`h-full rounded-full animate-pulse ${
              variant === 'analysis' ? 'bg-purple-400' :
              variant === 'form' ? 'bg-blue-400' :
              'bg-blue-400'
            }`}
            style={{
              width: '60%',
              animation: 'progress 2s ease-in-out infinite'
            }}
          ></div>
        </div>
        
        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; opacity: 0.8; }
            50% { width: 70%; opacity: 1; }
            100% { width: 100%; opacity: 0.8; }
          }
        `}</style>
      </div>
    )
  }
  
  // Skeleton components for form loading
  export const SkeletonField = ({ width = 'w-full' }: { width?: string }) => (
    <div className="space-y-2 animate-pulse">
      <div className={`h-4 bg-gray-200 rounded ${width === 'w-full' ? 'w-32' : width}`}></div>
      <div className="h-10 bg-gray-100 rounded border border-gray-200 w-full"></div>
    </div>
  )
  
  // Form loading animation with shimmer effect
  export const FormLoadingSkeleton = ({ stylingConfig }: { 
    stylingConfig: { 
      backgroundColor: string
      fontFamily: string
      fontColor: string
      buttonColor: string
    } 
  }) => (
    <div 
      className="border-2 border-black rounded-lg p-6 relative overflow-hidden"
      style={{ 
        background: stylingConfig.backgroundColor,
        fontFamily: stylingConfig.fontFamily,
        color: stylingConfig.fontColor
      }}
    >
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          animation: 'shimmer 2s ease-in-out infinite',
          transform: 'translateX(-100%)'
        }}
      />
      
      {/* Content with progressive loading */}
      <div className="space-y-6 relative z-10">
        {/* Form title skeleton */}
        <div className="flex items-center space-x-3">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        {/* Progressive field loading with staggered opacity */}
        <div className="space-y-4">
          <div style={{ animationDelay: '0ms' }} className="animate-fadeIn">
            <SkeletonField width="w-40" />
          </div>
          <div style={{ animationDelay: '200ms' }} className="animate-fadeIn opacity-0">
            <SkeletonField width="w-36" />
          </div>
          <div style={{ animationDelay: '400ms' }} className="animate-fadeIn opacity-0">
            <SkeletonField width="w-44" />
          </div>
          <div style={{ animationDelay: '600ms' }} className="animate-fadeIn opacity-0">
            <SkeletonField width="w-32" />
          </div>
        </div>
        
        {/* Submit button skeleton */}
        <div className="animate-pulse" style={{ animationDelay: '800ms' }}>
          <div 
            className="h-10 rounded-lg w-32 animate-fadeIn opacity-0"
            style={{ 
              backgroundColor: stylingConfig.buttonColor,
              opacity: 0.3
            }}
          />
        </div>
      </div>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )