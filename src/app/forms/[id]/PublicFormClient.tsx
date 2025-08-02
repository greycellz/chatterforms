'use client'

import { useState } from 'react'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  size?: string
}

interface FormSchema {
  title: string
  fields: FormField[]
  styling?: {
    globalFontSize?: string
    fieldSizes?: Record<string, string>
  }
}

interface PublicFormClientProps {
  formSchema: FormSchema
  formId: string
  submitButtonText?: string
}

// Utility functions for sizing (copied from SizeUtilities)
function getInputSizeClasses(size: string = 'm'): string {
  const sizeMap = {
    xs: 'px-2 py-1 text-xs',
    s: 'px-2.5 py-1.5 text-sm',
    m: 'px-3 py-2 text-base',
    l: 'px-4 py-3 text-lg',
    xl: 'px-5 py-4 text-xl'
  }
  
  return sizeMap[size as keyof typeof sizeMap] || sizeMap.m
}

function getTextSizeClasses(globalSize: string = 'm', element: 'title' | 'label' = 'label'): string {
  const sizeMap = {
    title: {
      xs: 'text-lg',
      s: 'text-xl',
      m: 'text-2xl',
      l: 'text-3xl',
      xl: 'text-4xl'
    },
    label: {
      xs: 'text-xs',
      s: 'text-sm',
      m: 'text-base',
      l: 'text-lg',
      xl: 'text-xl'
    }
  }
  
  return sizeMap[element][globalSize as keyof typeof sizeMap.label] || sizeMap[element].m
}

function getButtonSizeClasses(globalSize: string = 'm'): string {
  const sizeMap = {
    xs: 'px-3 py-1.5 text-xs',
    s: 'px-4 py-2 text-sm',
    m: 'px-6 py-2 text-base',
    l: 'px-8 py-3 text-lg',
    xl: 'px-10 py-4 text-xl'
  }
  
  return sizeMap[globalSize as keyof typeof sizeMap] || sizeMap.m
}

export default function PublicFormClient({ formSchema, formId, submitButtonText = 'Submit Form' }: PublicFormClientProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean | string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const globalSize = formSchema.styling?.globalFontSize || 'm'
  const fieldSizes = formSchema.styling?.fieldSizes || {}

  const handleInputChange = (fieldId: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          data: formData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const fieldSize = fieldSizes[field.id] || field.size || 'm'
    const baseClasses = "w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
    const sizeClasses = getInputSizeClasses(fieldSize)

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.id}
            key={field.id}
            value={typeof formData[field.id] === 'string' ? formData[field.id] as string : ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} ${sizeClasses} h-24 resize-none`}
            required={field.required}
          />
        )
      case 'select':
        return (
          <select 
            id={field.id}
            name={field.id}
            key={field.id}
            value={typeof formData[field.id] === 'string' ? formData[field.id] as string : ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${baseClasses} ${sizeClasses}`} 
            required={field.required}
          >
            <option value="">Choose an option</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            {field.options?.map((option, idx) => (
              <label key={idx} htmlFor={`${field.id}-${idx}`} className="flex items-center space-x-3 cursor-pointer">
                <input
                  id={`${field.id}-${idx}`}
                  name={field.id}
                  type="radio"
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  required={field.required}
                />
                <span className={`text-gray-900 font-medium ${getTextSizeClasses(globalSize, 'label')}`}>{option}</span>
              </label>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <label key={field.id} htmlFor={field.id} className="flex items-center space-x-2">
            <input
              id={field.id}
              name={field.id}
              type="checkbox"
              checked={typeof formData[field.id] === 'boolean' ? formData[field.id] as boolean : false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required={field.required}
            />
            <span className={getTextSizeClasses(globalSize, 'label')}>{field.label}</span>
          </label>
        )
      default:
        return (
          <input
            id={field.id}
            name={field.id}
            key={field.id}
            type={field.type}
            value={typeof formData[field.id] === 'string' ? formData[field.id] as string : ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} ${sizeClasses}`}
            required={field.required}
          />
        )
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className={`font-bold text-gray-900 mb-2 ${getTextSizeClasses(globalSize, 'title')}`}>Thank you!</h2>
        <p className={`text-gray-600 ${getTextSizeClasses(globalSize, 'label')}`}>Your form has been submitted successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formSchema.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className={`block font-medium text-gray-700 ${getTextSizeClasses(globalSize, 'label')}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}
      
      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <button 
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${getButtonSizeClasses(globalSize)}`}
      >
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </button>
    </form>
  )
}