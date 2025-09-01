'use client'

import React, { useState } from 'react'
import styles from './AuthModal.module.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: { id: string; email: string; firstName: string; lastName: string; name: string; emailVerified: boolean; plan: string; status: string }, token: string) => void
  initialMode?: 'login' | 'signup'
}

interface AuthFormData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

interface PasswordValidation {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialMode = 'login' 
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types

    // Real-time password validation for signup mode
    if (name === 'password' && mode === 'signup') {
      const validation = {
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[@$!%*?&]/.test(value)
      }
      setPasswordValidation(validation)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_URL
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup'
      
      console.log('🔍 Sending data:', formData)
      console.log('🔍 API URL:', `${apiUrl}${endpoint}`)
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('🔍 Response status:', response.status)
      const data = await response.json()
      console.log('🔍 Response data:', data)

      if (data.success) {
        if (mode === 'signup') {
          setSuccessMessage('Account created successfully! Please check your email to verify your account.')
          // Don't close modal yet for signup - show success message
        } else {
          // Login successful
          onSuccess(data.data.user, data.data.token)
          onClose()
        }
      } else {
        setError(data.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setSuccessMessage('')
    setFormData({ email: '', password: '', firstName: '', lastName: '' })
    setPasswordValidation({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    })
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {successMessage ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <p>{successMessage}</p>
            <button 
              className={styles.primaryButton}
              onClick={() => {
                setSuccessMessage('')
                setMode('login')
              }}
            >
              Continue to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'signup' && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
              {mode === 'signup' && (
                <div className={styles.passwordRequirements}>
                  <small>Password must contain:</small>
                  <ul>
                    <li className={passwordValidation.length ? styles.valid : styles.invalid}>
                      {passwordValidation.length ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={passwordValidation.uppercase ? styles.valid : styles.invalid}>
                      {passwordValidation.uppercase ? '✓' : '○'} One uppercase letter (A-Z)
                    </li>
                    <li className={passwordValidation.lowercase ? styles.valid : styles.invalid}>
                      {passwordValidation.lowercase ? '✓' : '○'} One lowercase letter (a-z)
                    </li>
                    <li className={passwordValidation.number ? styles.valid : styles.invalid}>
                      {passwordValidation.number ? '✓' : '○'} One number (0-9)
                    </li>
                    <li className={passwordValidation.special ? styles.valid : styles.invalid}>
                      {passwordValidation.special ? '✓' : '○'} One special character (@$!%*?&)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loadingSpinner}>⏳</span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button 
              type="button" 
              className={styles.secondaryButton}
              onClick={switchMode}
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
