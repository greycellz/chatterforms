'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import styles from './SubmissionsPage.module.css'

interface Submission {
  submission_id: string
  form_id: string
  user_id: string
  submission_data: Record<string, any>
  timestamp: string
  ip_address: string
  user_agent: string
  is_hipaa: boolean
  encrypted: boolean
}

interface FormData {
  form_id: string
  title: string
  fields: Array<{
    id: string
    label: string
    type: string
    required: boolean
  }>
}

export default function SubmissionsPage() {
  const params = useParams()
  const formId = params.formId as string
  
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch form data
        const formResponse = await fetch(`${process.env.NEXT_PUBLIC_RAILWAY_URL}/api/forms/${formId}`)
        if (formResponse.ok) {
          const formResult = await formResponse.json()
          if (formResult.success && formResult.form) {
            setFormData({
              form_id: formResult.form.form_id,
              title: formResult.form.structure?.title || formResult.form.title || 'Untitled Form',
              fields: formResult.form.structure?.fields || []
            })
          }
        }
        
        // Fetch submissions
        const submissionsResponse = await fetch(`${process.env.NEXT_PUBLIC_RAILWAY_URL}/api/forms/${formId}/submissions`)
        if (submissionsResponse.ok) {
          const submissionsResult = await submissionsResponse.json()
          if (submissionsResult.success) {
            setSubmissions(submissionsResult.submissions || [])
          }
        } else {
          setError('Failed to fetch submissions')
        }
      } catch (err) {
        setError('Error loading data')
        console.error('Error fetching submissions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (formId) {
      fetchData()
    }
  }, [formId])

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  const renderSubmissionData = (submission: Submission) => {
    if (!formData) return null

    return (
      <div className={styles.submissionFields}>
        {formData.fields.map((field) => {
          const value = submission.submission_data[field.id]
          if (value === undefined || value === null || value === '') return null
          
          return (
            <div key={field.id} className={styles.fieldRow}>
              <label className={styles.fieldLabel}>{field.label}:</label>
              <div className={styles.fieldValue}>
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const toggleSubmissionExpansion = (submissionId: string) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId)
  }

  const getTableColumns = () => {
    if (!formData?.fields) return []
    
    // Get the most common fields that have values
    const fieldCounts = new Map<string, number>()
    submissions.forEach(submission => {
      Object.keys(submission.submission_data).forEach(fieldId => {
        fieldCounts.set(fieldId, (fieldCounts.get(fieldId) || 0) + 1)
      })
    })
    
    // Sort by frequency and take top 5 fields
    const topFields = Array.from(fieldCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([fieldId]) => fieldId)
    
    return formData.fields
      .filter(field => topFields.includes(field.id))
      .slice(0, 5) // Limit to 5 columns for readability
  }

  const getFieldValue = (submission: Submission, fieldId: string) => {
    const value = submission.submission_data[fieldId]
    if (value === undefined || value === null || value === '') return '-'
    if (Array.isArray(value)) return value.join(', ')
    return String(value).length > 30 ? String(value).substring(0, 30) + '...' : String(value)
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Form Submissions</h1>
        <div className={styles.formInfo}>
          <h2>{formData?.title || 'Untitled Form'}</h2>
          <p>Form ID: {formId}</p>
          <p>Total Submissions: {submissions.length}</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>No submissions yet</h3>
          <p>This form hasn't received any submissions yet.</p>
        </div>
      ) : (
        <div className={styles.submissionsContainer}>
          {/* Table Header */}
          <div className={styles.tableHeader}>
            <div className={styles.tableRow}>
              <div className={styles.tableCell}>Submission #</div>
              <div className={styles.tableCell}>Date</div>
              {getTableColumns().map(field => (
                <div key={field.id} className={styles.tableCell}>
                  {field.label}
                </div>
              ))}
              <div className={styles.tableCell}>Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className={styles.tableBody}>
            {submissions.map((submission, index) => (
              <div key={submission.submission_id} className={styles.tableRowContainer}>
                <div 
                  className={`${styles.tableRow} ${styles.clickableRow}`}
                  onClick={() => toggleSubmissionExpansion(submission.submission_id)}
                >
                  <div className={styles.tableCell}>
                    #{submissions.length - index}
                  </div>
                  <div className={styles.tableCell}>
                    {formatTimestamp(submission.timestamp)}
                  </div>
                  {getTableColumns().map(field => (
                    <div key={field.id} className={styles.tableCell}>
                      {getFieldValue(submission, field.id)}
                    </div>
                  ))}
                  <div className={styles.tableCell}>
                    <button className={styles.expandButton}>
                      {expandedSubmission === submission.submission_id ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {/* Expanded Submission Details */}
                {expandedSubmission === submission.submission_id && (
                  <div className={styles.expandedDetails}>
                    <div className={styles.submissionCard}>
                      <div className={styles.submissionHeader}>
                        <h3>Submission #{submissions.length - index} - Full Details</h3>
                        <div className={styles.submissionMeta}>
                          <span className={styles.timestamp}>
                            {formatTimestamp(submission.timestamp)}
                          </span>
                          <span className={styles.submissionId}>
                            ID: {submission.submission_id}
                          </span>
                        </div>
                      </div>
                      
                      {renderSubmissionData(submission)}
                      
                      <div className={styles.submissionFooter}>
                        <div className={styles.metadata}>
                          <span>IP: {submission.ip_address}</span>
                          <span>User Agent: {submission.user_agent}</span>
                          {submission.is_hipaa && <span className={styles.hipaaBadge}>HIPAA</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CSV Download Button */}
          <div className={styles.actionsSection}>
            <button className={styles.csvDownloadButton}>
              📥 Download CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
