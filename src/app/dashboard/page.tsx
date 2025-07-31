'use client'

import { useState } from 'react'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FormSchema {
  title: string
  fields: FormField[]
}

export default function Dashboard() {
  const [description, setDescription] = useState('')
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedFormId, setPublishedFormId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([])

  const generateForm = async (isEdit = false) => {
    if (!description.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description,
          currentForm: isEdit ? formSchema : null,
          isEdit
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate form')
      }

      setFormSchema(data.formSchema)
      
      // Add to chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: description },
        { role: 'assistant', content: isEdit ? 'Form updated!' : 'Form created!' }
      ])
      
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const publishForm = async () => {
    if (!formSchema) return

    setIsPublishing(true)
    setError('')

    try {
      const response = await fetch('/api/publish-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formSchema }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish form')
      }

      setPublishedFormId(data.formId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsPublishing(false)
    }
  }

  const renderField = (field: FormField) => {
    const baseClasses = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.id}
            placeholder={field.placeholder}
            className={`${baseClasses} h-24 resize-none`}
            required={field.required}
          />
        )
      case 'select':
        return (
          <select key={field.id} className={baseClasses} required={field.required}>
            <option value="">Choose an option</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <label key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required={field.required}
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
          />
        )
    }
  }

  return (
    <div className="h-screen flex">
      {/* Chat Panel - Light Yellow Background */}
      <div className="w-1/3 bg-yellow-50 border-r border-gray-200 p-4 flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Describe your form</h2>
        
        {/* Chat History - Show more before scrolling */}
        {chatHistory.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Chat History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {chatHistory.map((message, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  <span className="font-medium">
                    {message.role === 'user' ? 'You: ' : 'AI: '}
                  </span>
                  {message.content}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input section - takes remaining space */}
        <div className="space-y-4 flex-1 flex flex-col justify-end">
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              formSchema 
                ? "Add a gender field after date of birth with dropdown options male, female..."
                : "I need a patient intake form with contact info, insurance details..."
            }
            className="w-full h-32 p-3 bg-white text-black border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button 
            onClick={() => generateForm(!!formSchema)}
            disabled={isLoading || !description.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (formSchema ? 'Update Form' : 'Generate Form')}
          </button>

          {formSchema && (
            <button 
              onClick={publishForm}
              disabled={isPublishing}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'Publishing...' : 'Publish Form'}
            </button>
          )}

          {publishedFormId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Form Published!</p>
              <p className="text-xs text-green-600 mb-2">Share this link:</p>
              <a 
                href={`/forms/${publishedFormId}`}
                target="_blank"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {window.location.origin}/forms/{publishedFormId}
              </a>
            </div>
          )}
          
          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel - White Background */}
      <div className="flex-1 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Form Preview</h2>
        
        {/* Form Preview Container - Black Border, Light Blue Background */}
        <div className="bg-blue-50 border-2 border-black rounded-lg p-6">
          {formSchema ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{formSchema.title}</h3>
              
              {formSchema.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
              
              <button className="mt-6 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                Submit Form
              </button>
            </div>
          ) : (
            <p className="text-gray-600 text-center">
              {isLoading ? 'Generating your form...' : 'Your form will appear here...'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}