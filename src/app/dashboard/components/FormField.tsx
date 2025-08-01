interface FormField {
    id: string
    type: string
    label: string
    required: boolean
    placeholder?: string
    options?: string[]
  }
  
  interface FormFieldComponentProps {
    field: FormField
  }
  
  export default function FormField({ field }: FormFieldComponentProps) {
    const baseClasses = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.id}
            placeholder={field.placeholder}
            className={`${baseClasses} h-24 resize-none`}
            required={field.required}
            readOnly
          />
        )
      case 'select':
        return (
          <select key={field.id} className={baseClasses} required={field.required} disabled>
            <option value="">{field.placeholder || 'Choose an option'}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  className="text-blue-600 focus:ring-blue-500"
                  required={field.required}
                  disabled
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <label key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required={field.required}
              disabled
            />
            <span>{field.label}</span>
          </label>
        )
      default:
        return (
          <input
            key={field.id}
            type={field.type}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
            readOnly
          />
        )
    }
  }