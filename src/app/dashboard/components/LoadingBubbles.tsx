interface LoadingBubblesProps {
    message: string
    icon?: string
  }
  
  export default function LoadingBubbles({ message, icon = "🔍" }: LoadingBubblesProps) {
    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{icon}</span>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700 font-medium">{message}</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }