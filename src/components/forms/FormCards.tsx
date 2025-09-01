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
  form_id?: string
  user_id?: string
  updated_at?: {
    _seconds: number
    _nanoseconds: number
  }
}

export default function FormCards() {
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  
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

  const [sortBy, setSortBy] = useState<'lastEdited' | 'newest' | 'submissions'>('lastEdited')

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
    let filtered = forms

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(form =>
        form.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(form => form.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastEdited':
          return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
        case 'newest':
          return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
        case 'submissions':
          return b.submissionCount - a.submissionCount
        default:
          return 0
      }
    })

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
      return 'Recently edited'
    }
    
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Edited yesterday'
    if (diffDays < 7) return `Edited ${diffDays} days ago`
    if (diffDays < 30) return `Edited ${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `Edited ${Math.ceil(diffDays / 30)} months ago`
    return `Edited ${Math.ceil(diffDays / 365)} years ago`
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
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
              className={styles.filterSelect}
            >
              <option value="all">All Forms</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'lastEdited' | 'newest' | 'submissions')}
              className={styles.sortSelect}
            >
              <option value="lastEdited">Last Edited</option>
              <option value="newest">Newest</option>
              <option value="submissions">Most Submissions</option>
            </select>
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
        <h2 className={styles.title}>
          {isAnonymous ? 'Your Forms' : `${user?.name || 'User'}'s Forms`}
          {isAnonymous && (
            <span className={styles.anonymousBadge}>
              Anonymous Session
            </span>
          )}
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
          </div>
                      <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
              className={styles.filterSelect}
            >
              <option value="all">All Forms</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'lastEdited' | 'newest' | 'submissions')}
              className={styles.sortSelect}
            >
            <option value="lastEdited">Last Edited</option>
            <option value="newest">Newest</option>
            <option value="submissions">Most Submissions</option>
          </select>
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
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className={styles.formCard}
              onClick={() => handleFormClick(form.id)}
            >
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>
                  {form.structure?.title || form.title || 'Untitled Form'}
                </h3>
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
              </div>
              
              <div className={styles.formMetadata}>
                <p className={styles.lastEdited}>
                  {formatDate(form.updated_at || form.lastEdited)}
                </p>
                <p className={styles.submissions}>
                  {form.submissionCount} submission{form.submissionCount !== 1 ? 's' : ''}
                </p>
                {form.migratedAt && (
                  <p className={styles.migratedInfo}>
                    Migrated on {formatDate(form.migratedAt)}
                  </p>
                )}
              </div>

              <div className={styles.formActions}>
                <button className={styles.actionButton}>
                  Edit Form
                </button>
                <button className={styles.actionButton}>
                  View Form
                </button>
                <button className={styles.actionButton}>
                  Submissions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
