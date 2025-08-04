import { useState } from 'react'

interface FieldExtraction {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date'
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
}

interface FieldExtractionReviewProps {
  extractedFields: FieldExtraction[]
  uploadedImage: string | null
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
}

export default function FieldExtractionReview({
  extractedFields,
  uploadedImage,
  onFieldsValidated,
  onResetAnalysis
}: FieldExtractionReviewProps) {
  const [fields, setFields] = useState<FieldExtraction[]>(extractedFields)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [additionalInstructions, setAdditionalInstructions] = useState('')

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' }
  ]

  const updateField = (fieldId: string, updates: Partial<FieldExtraction>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const removeField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
  }

  const addField = () => {
    const newField: FieldExtraction = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      confidence: 1.0
    }
    setFields(prev => [...prev, newField])
    setEditingField(newField.id)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return '✅'
    if (confidence >= 0.6) return '⚠️'
    return '❓'
  }

  const handleValidateFields = () => {
    if (additionalInstructions.trim()) {
      // Add instructions to the first field as context for form generation
      const fieldsWithContext = fields.map((field, index) => 
        index === 0 
          ? { ...field, additionalContext: additionalInstructions }
          : field
      )
      onFieldsValidated(fieldsWithContext)
    } else {
      onFieldsValidated(fields)
    }
  }

  const handleTypeChange = (fieldId: string, newType: string) => {
    const validType = fieldTypes.find(t => t.value === newType)?.value || 'text'
    updateField(fieldId, { type: validType as FieldExtraction['type'] })
  }

  return (
    <div className="mb-4 space-y-4">
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
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedImage}
            alt="Analyzed screenshot"
            className="max-w-full max-h-24 mx-auto rounded border shadow-sm"
          />
        </div>
      )}

      {/* Extracted Fields List */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">📋 Extracted Fields ({fields.length})</h4>
          <button
            onClick={addField}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            + Add Field
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {fields.map((field) => (
            <div
              key={field.id}
              className="border border-gray-200 rounded p-2 bg-gray-50"
            >
              {editingField === field.id ? (
                // Edit Mode
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Field label"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => handleTypeChange(field.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {field.placeholder !== undefined && (
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Placeholder text"
                    />
                  )}
                  
                  {(field.type === 'select' || field.type === 'radio') && (
                    <input
                      type="text"
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => updateField(field.id, { 
                        options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                      })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Options (comma separated)"
                    />
                  )}
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="mr-1"
                      />
                      Required
                    </label>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingField(null)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={getConfidenceColor(field.confidence)}>
                        {getConfidenceIcon(field.confidence)}
                      </span>
                      <span className="font-medium text-sm">{field.label}</span>
                      <span className="text-xs text-gray-500">({field.type})</span>
                      {field.required && <span className="text-red-500 text-xs">*</span>}
                    </div>
                    {field.placeholder && (
                      <div className="text-xs text-gray-500 ml-6">
                        Placeholder: {field.placeholder}
                      </div>
                    )}
                    {field.options && field.options.length > 0 && (
                      <div className="text-xs text-gray-500 ml-6">
                        Options: {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingField(field.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          💬 Additional instructions (optional):
        </label>
        <textarea
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          placeholder="e.g., Add form title 'Patient Intake', make phone field required, use medical styling..."
          className="w-full h-16 p-2 text-sm bg-white border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleValidateFields}
          disabled={fields.length === 0}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          ✅ Generate Form ({fields.length} fields)
        </button>
        <button
          onClick={onResetAnalysis}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          🔄 Re-analyze
        </button>
      </div>
    </div>
  )
}