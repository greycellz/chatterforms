interface RequiredToggleProps {
    fieldId: string
    isRequired: boolean
    onToggle: (fieldId: string, required: boolean) => void
  }
  
  export default function RequiredToggle({ fieldId, isRequired, onToggle }: RequiredToggleProps) {
    return (
      <div className="flex items-center ml-3 space-x-2">
        <label className="flex items-center cursor-pointer" title={isRequired ? "Make optional" : "Make required"}>
          <div className="relative">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => onToggle(fieldId, e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-all duration-200 ease-in-out shadow-inner ${
              isRequired 
                ? 'bg-blue-500 shadow-blue-200' 
                : 'bg-gray-300 shadow-gray-100'
            }`}
            style={{
              boxShadow: isRequired 
                ? '0 2px 4px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.1)' 
                : '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out mt-0.5 ${
                isRequired ? 'translate-x-5' : 'translate-x-0.5'
              }`}
              style={{
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)'
              }} />
            </div>
          </div>
          <span className={`text-xs font-semibold ml-2 px-2 py-1 rounded-full transition-colors duration-200 ${
            isRequired 
              ? 'text-blue-700 bg-blue-100' 
              : 'text-gray-600 bg-gray-100'
          }`}>
            {isRequired ? 'Required' : 'Optional'}
          </span>
        </label>
      </div>
    )
  }