'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts'
import { useRouter } from 'next/navigation'
import styles from './FormCards.module.css'

interface Form {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  lastEdited: string
  submissionCount: number
  isHIPAA: boolean
  isAnonymous?: boolean
  migratedAt?: string
  // Backend data structure fields
  structure?: {
    title: string
    fields: unknown[]
  }
  metadata?: {
    created_at?: string
    updated_at?: string
  }
  form_id?: string
  user_id?: string
  updated_at?: {
    _seconds: number
    _nanoseconds: number
  }
  created_at?: string
  createdAt?: string
  lastSubmissionDate?: string
}

interface FormCardsProps {
  showAllForms?: boolean
}

export default function FormCards({ showAllForms = false }: FormCardsProps) {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isAnonymous, 
    anonymousUserId, 
    getCurrentUserId,
    createAnonymousSession 
  } = useUser()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [filteredForms, setFilteredForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'hipaa' | 'non-hipaa'>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(`.${styles.filterIcon}`) && !target.closest(`.${styles.filterDropdown}`) && 
          !target.closest(`.${styles.sortIcon}`) && !target.closest(`.${styles.sortDropdown}`)) {
        setShowFilterDropdown(false)
        setShowSortDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const fetchUserForms = useCallback(async () => {
    try {
      setIsLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_URL
      const currentUserId = getCurrentUserId()
      
      if (!currentUserId) {
        console.log('No user ID available for fetching forms')
        setForms([])
        return
      }
      
      console.log('🔍 Fetching forms for user:', currentUserId)
      console.log('🔍 API URL:', `${apiUrl}/api/forms/user/${currentUserId}`)
      console.log('🔍 Is authenticated:', isAuthenticated)
      console.log('🔍 Is anonymous:', isAnonymous)
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header only for authenticated users
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${apiUrl}/api/forms/user/${currentUserId}`, {
        headers
      })

      console.log('🔍 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Forms data:', data)
        setForms(data.forms || [])
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch forms:', response.status, errorText)
        setForms([])
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
      setForms([])
    } finally {
      setIsLoading(false)
    }
  }, [getCurrentUserId, isAuthenticated, token, isAnonymous])

  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 State changed - statusFilter:', statusFilter, 'sortBy:', sortBy)
  }, [statusFilter, sortBy])

  // Fetch user's forms
  useEffect(() => {
    const loadForms = async () => {
      if (isAuthenticated && user) {
        // Authenticated user - fetch their forms
        console.log('🔍 Fetching forms for authenticated user:', user.id)
        await fetchUserForms()
      } else if (isAnonymous && anonymousUserId) {
        // Anonymous user with existing session - fetch their forms
        console.log('🔍 Fetching forms for anonymous user:', anonymousUserId)
        await fetchUserForms()
      } else if (!isAuthenticated && !isAnonymous) {
        // No user and no anonymous session - create anonymous session
        console.log('🆕 Creating anonymous session for new user')
        try {
          const newAnonymousUserId = await createAnonymousSession()
          console.log('🆕 Anonymous session created, now fetching forms for:', newAnonymousUserId)
          // After creating session, fetch forms
          await fetchUserForms()
        } catch (error) {
          console.error('Failed to create anonymous session:', error)
          setForms([])
        }
      }
    }
    
    loadForms()
  }, [isAuthenticated, user, isAnonymous, anonymousUserId, fetchUserForms, createAnonymousSession])

  // Filter and sort forms when search or filters change
  useEffect(() => {
    console.log('🔍 useEffect triggered with:', { searchQuery, statusFilter, sortBy, formsCount: forms.length })
    let filtered = forms

    // Apply search filter
    if (searchQuery) {
      console.log('🔍 Searching for:', searchQuery)
      console.log('🔍 Forms before search:', filtered.length)
      filtered = filtered.filter(form => {
        const title = form.structure?.title || form.title || ''
        const matches = title.toLowerCase().includes(searchQuery.toLowerCase())
        console.log('🔍 Form title:', title, 'matches:', matches)
        return matches
      })
      console.log('🔍 Forms after search:', filtered.length)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      console.log('🔍 Applying filter:', statusFilter)
      console.log('🔍 Forms before filter:', filtered.length)
      
      if (statusFilter === 'hipaa') {
        filtered = filtered.filter(form => {
          const isHIPAA = form.isHIPAA === true
          console.log('🔍 Form:', form.structure?.title || form.title, 'isHIPAA:', form.isHIPAA, 'matches:', isHIPAA)
          return isHIPAA
        })
      } else if (statusFilter === 'non-hipaa') {
        filtered = filtered.filter(form => {
          const isNonHIPAA = form.isHIPAA === false
          console.log('🔍 Form:', form.structure?.title || form.title, 'isHIPAA:', form.isHIPAA, 'matches:', isNonHIPAA)
          return isNonHIPAA
        })
      } else {
        filtered = filtered.filter(form => {
          const matches = form.status === statusFilter
          console.log('🔍 Form:', form.structure?.title || form.title, 'status:', form.status, 'filter:', statusFilter, 'matches:', matches)
          return matches
        })
      }
      console.log('🔍 Forms after filter:', filtered.length)
    }

    // Apply sorting
    console.log('🔍 Applying sort:', sortBy)
    console.log('🔍 Forms before sort:', filtered.length)
    
    filtered.sort((a, b) => {
      let result = 0
      switch (sortBy) {
        case 'newest':
          const dateA = parseDate(b.updated_at || b.lastEdited)
          const dateB = parseDate(a.updated_at || a.lastEdited)
          result = dateA.getTime() - dateB.getTime()
          console.log('🔍 Sort newest - Form A:', a.structure?.title || a.title, 'date:', dateA, 'Form B:', b.structure?.title || b.title, 'date:', dateB, 'result:', result)
          break
        case 'oldest':
          const dateAOld = parseDate(a.updated_at || a.lastEdited)
          const dateBOld = parseDate(b.updated_at || b.lastEdited)
          result = dateAOld.getTime() - dateBOld.getTime()
          console.log('🔍 Sort oldest - Form A:', a.structure?.title || a.title, 'date:', dateAOld, 'Form B:', b.structure?.title || b.title, 'date:', dateBOld, 'result:', result)
          break
        case 'name':
          result = (a.structure?.title || a.title).localeCompare(b.structure?.title || b.title)
          console.log('🔍 Sort name - Form A:', a.structure?.title || a.title, 'Form B:', b.structure?.title || b.title, 'result:', result)
          break
        default:
          console.log('🔍 Unknown sort type:', sortBy)
          result = 0
      }
      return result
    })
    
    console.log('🔍 Forms after sort:', filtered.length)

    setFilteredForms(filtered)
  }, [forms, searchQuery, statusFilter, sortBy])

  const handleFormClick = (formId: string) => {
    router.push(`/dashboard?formId=${formId}`)
  }

  const formatDate = (dateString: string | { _seconds: number; _nanoseconds: number }) => {
    let date: Date
    
    if (typeof dateString === 'string') {
      date = new Date(dateString)
    } else if (dateString._seconds) {
      // Handle Firestore timestamp
      date = new Date(dateString._seconds * 1000)
    } else {
      return 'Unknown date'
    }
    
    // Return actual date in MM/DD/YYYY format
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCreatedDate = (dateString: string | { _seconds: number; _nanoseconds: number } | undefined) => {
    if (!dateString) return 'Unknown date'
    
    let date: Date
    
    if (typeof dateString === 'string') {
      date = new Date(dateString)
    } else if (dateString._seconds) {
      // Handle Firestore timestamp
      date = new Date(dateString._seconds * 1000)
    } else {
      return 'Unknown date'
    }
    
    // Return actual date in MM/DD/YYYY format
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#059669'
      case 'draft':
        return '#d97706'
      case 'archived':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published'
      case 'draft':
        return 'Draft'
      case 'archived':
        return 'Archived'
      default:
        return 'Unknown'
    }
  }

  const handleDeleteForm = async (formId: string, formTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${formTitle}"?\n\nThis will permanently remove:\n• The form structure\n• All form submissions\n• Form analytics\n• Any associated data\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) return
    
    try {
      console.log(`🗑️ Deleting form: ${formId}`)
      
      const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_URL
      const response = await fetch(`${apiUrl}/api/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (response.ok) {
        console.log(`✅ Form deleted successfully: ${formId}`)
        // Remove form from local state
        setForms(prevForms => prevForms.filter(form => form.id !== formId))
        // Show success message (you could add a toast notification here)
        alert('Form deleted successfully')
      } else {
        const errorData = await response.json()
        console.error(`❌ Failed to delete form: ${formId}`, errorData)
        alert(`Failed to delete form: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`❌ Error deleting form: ${formId}`, error)
      alert('Failed to delete form. Please try again.')
    }
  }

  // Helper function to convert date to Date object
  const parseDate = (dateInput: string | { _seconds: number; _nanoseconds: number } | undefined): Date => {
    if (typeof dateInput === 'string') {
      return new Date(dateInput)
    } else if (dateInput && typeof dateInput === 'object' && '_seconds' in dateInput) {
      return new Date(dateInput._seconds * 1000)
    } else {
      return new Date()
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isAnonymous ? 'Your Forms' : `${user?.name || 'User'}'s Forms`}
          </h2>
          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button className={styles.filterIcon} disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
                </svg>
              </button>
              <button className={styles.sortIcon} disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M6 12h12M9 18h6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your forms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            {isAnonymous ? 'Your Forms' : `${user?.name || 'User'}'s Forms`}
            {isAnonymous && (
              <span className={styles.anonymousBadge}>
                Anonymous Session
              </span>
            )}
          </h2>
          {!showAllForms && (
            <a href="/workspace" className={styles.viewAllLink}>
              View All →
            </a>
          )}
        </div>
        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.buttonContainer}>
              <button 
                className={styles.filterIcon}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                title="Filter forms"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
                </svg>
                
                {/* Filter Dropdown */}
                {showFilterDropdown && (
                  <div className={styles.filterDropdown}>
                    <div className={styles.dropdownItem} onClick={() => { 
                      console.log('🔍 Filter clicked: All Forms'); 
                      setStatusFilter('all'); 
                      setShowFilterDropdown(false); 
                    }}>
                      All Forms
                    </div>
                    <div className={styles.dropdownItem} onClick={() => { 
                      console.log('🔍 Filter clicked: Draft'); 
                      setStatusFilter('draft'); 
                      setShowFilterDropdown(false); 
                    }}>
                      Draft
                    </div>
                    <div className={styles.dropdownItem} onClick={() => { 
                      console.log('🔍 Filter clicked: Published'); 
                      setStatusFilter('published'); 
                      setShowFilterDropdown(false); 
                    }}>
                      Published
                    </div>
                    <div className={styles.dropdownItem} onClick={() => { 
                      console.log('🔍 Filter clicked: HIPAA'); 
                      setStatusFilter('hipaa'); 
                      setShowFilterDropdown(false); 
                    }}>
                      HIPAA
                    </div>
                    <div className={styles.dropdownItem} onClick={() => { 
                      console.log('🔍 Filter clicked: Non-HIPAA'); 
                      setStatusFilter('non-hipaa'); 
                      setShowFilterDropdown(false); 
                    }}>
                      Non-HIPAA
                    </div>
                  </div>
                )}
              </button>
              
              <button 
                className={styles.sortIcon}
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                title="Sort forms"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M6 12h12M9 18h6"/>
                </svg>
                
                {/* Sort Dropdown */}
                {showSortDropdown && (
                  <div className={styles.sortDropdown}>
                    <div className={styles.dropdownItem} onClick={() => { 
                      console.log('🔍 Sort clicked: Newest First'); 
                      setSortBy('newest'); 
                      setShowSortDropdown(false); 
                    }}>
                      Newest First
                    </div>
                    <div className={styles.dropdownItem} onClick={() => { 
                      console.log('🔍 Sort clicked: Oldest First'); 
                      setSortBy('oldest'); 
                      setShowSortDropdown(false); 
                    }}>
                      Oldest First
                    </div>
                    <div className={styles.dropdownItem} onClick={() => { 
                      console.log('🔍 Sort clicked: Name'); 
                      setSortBy('name'); 
                      setShowSortDropdown(false); 
                    }}>
                      Name
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredForms.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>No forms yet</h3>
          <p>
            {isAnonymous 
              ? "Start creating forms to see them here. Sign up to save your forms permanently."
              : "Start creating forms to see them here."
            }
          </p>
          {isAnonymous && (
            <div className={styles.anonymousNote}>
              <p>💡 <strong>Anonymous forms are temporary</strong> and will be deleted after 30 days if you don&apos;t sign up.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.formsGrid}>
          {(showAllForms ? filteredForms : filteredForms.slice(0, 8)).map((form) => (
            <div
              key={form.id}
              className={styles.formCard}
              onClick={() => handleFormClick(form.id)}
            >
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>
                  {form.structure?.title || form.title || 'Untitled Form'}
                </h3>
                {/* Mobile triple dots - always visible */}
                <button 
                  className={styles.mobileMenuButton}
                  onClick={(e) => {
                    e.stopPropagation() // Prevent form click
                    // TODO: Add mobile dropdown menu with delete option
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </button>
              </div>
              
              <div className={styles.formMetadata}>
                <p className={styles.createdDate}>
                  Created: {formatCreatedDate(form.metadata?.created_at || form.created_at || form.createdAt)}
                </p>
                <p className={styles.lastEdited}>
                  Last edit: {formatDate(form.metadata?.updated_at || form.updated_at || form.lastEdited)}
                </p>
                <p className={styles.submissions}>
                  {form.submissionCount} submission{form.submissionCount !== 1 ? 's' : ''}
                  {form.submissionCount > 0 && form.lastSubmissionDate && (
                    <span className={styles.lastSubmission}>
                      • Last: {formatDate(form.lastSubmissionDate)}
                    </span>
                  )}
                </p>
              </div>

              {/* Status badge moved to bottom-right */}
              <div className={styles.formStatus}>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(form.status) }}
                >
                  {getStatusText(form.status)}
                </span>
                {form.isAnonymous && (
                  <span className={styles.anonymousIndicator}>
                    🔒 Anonymous
                  </span>
                )}
              </div>

              {/* Hover overlay with action buttons */}
              <div className={styles.formActionsOverlay}>
                <button 
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation() // Prevent form click
                    window.open(`/dashboard?formId=${form.id}`, '_blank')
                  }}
                >
                  Edit Form
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation() // Prevent form click
                    // Open published form in new tab (not edit mode)
                    const publishedUrl = `${window.location.origin}/forms/${form.id}`
                    window.open(publishedUrl, '_blank')
                  }}
                >
                  View Form
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation() // Prevent form click
                    window.open(`/submissions/${form.id}`, '_blank')
                  }}
                >
                  Submissions
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={(e) => {
                    e.stopPropagation() // Prevent form click
                    handleDeleteForm(form.id, form.structure?.title || form.title || 'Untitled Form')
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
