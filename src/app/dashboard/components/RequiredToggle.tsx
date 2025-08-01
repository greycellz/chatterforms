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
            <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
              isRequired ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out mt-0.5 ${
                isRequired ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
          <span className={`text-xs font-medium ml-2 ${
            isRequired ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {isRequired ? 'Required' : 'Optional'}
          </span>
        </label>
      </div>
    )
  }