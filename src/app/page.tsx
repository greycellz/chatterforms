'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './landing.css'
import Link from 'next/link'
import plusButtonStyles from './styles/PlusButton.module.css'

const TYPING_EXAMPLES = [
  "Create a patient intake form with contact info and medical history...",
  "Build a job application form with resume upload and experience questions...",
  "Generate a customer feedback survey with rating scales and comments...",
  "Make a contact form with name, email, phone, and message fields...",
  "Design an event registration form with payment and dietary preferences..."
]

export default function Home() {
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState('')
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [showURLInput, setShowURLInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close popup on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPopup(false)
        setShowURLInput(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Typing animation effect
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (inputValue.trim()) {
      // User is typing, stop animation
      setCurrentPlaceholder('')
      setIsTyping(false)
      return
    }
    
    const typeExample = () => {
      const currentExample = TYPING_EXAMPLES[currentExampleIndex]
      let charIndex = 0
      setCurrentPlaceholder('')
      setIsTyping(true)
      
      const typeChar = () => {
        if (charIndex < currentExample.length) {
          setCurrentPlaceholder(currentExample.slice(0, charIndex + 1))
          charIndex++
          timeout = setTimeout(typeChar, 50)
        } else {
          // Pause at end, then clear and move to next
          timeout = setTimeout(() => {
            setIsTyping(false)
            timeout = setTimeout(() => {
              setCurrentPlaceholder('')
              setCurrentExampleIndex((prev) => (prev + 1) % TYPING_EXAMPLES.length)
            }, 1500)
          }, 2000)
        }
      }
      
      typeChar()
    }

    // Start typing animation after a short delay
    timeout = setTimeout(typeExample, 500)

    return () => clearTimeout(timeout)
  }, [currentExampleIndex, inputValue])

  // URL Detection Functions
  const isURLInput = (text: string): boolean => {
    // Direct URL patterns
    const urlPatterns = [
      /^https?:\/\/[^\s]+/i,                    // Direct URLs
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/,     // domain.com format
      /forms\.google\.com/i,                    // Google Forms
      /typeform\.com/i,                         // Typeform
      /surveymonkey\.com/i,                     // SurveyMonkey
      /jotform\.com/i,                          // JotForm
      /formstack\.com/i,                        // Formstack
      /wufoo\.com/i,                           // Wufoo
    ]
    
    // Natural language URL patterns
    const naturalPatterns = [
      /create.*like\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,        // "create like google.com"
      /similar.*to\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,        // "similar to typeform.com"
      /copy.*from\s+(https?:\/\/[^\s]+)/i,                     // "copy from https://..."
      /based.*on\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,          // "based on forms.google.com"
      /clone\s+(https?:\/\/[^\s]+)/i,                          // "clone https://..."
      /replicate\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,          // "replicate typeform.com"
    ]
    
    return urlPatterns.some(pattern => pattern.test(text)) ||
           naturalPatterns.some(pattern => pattern.test(text))
  }

  const extractURL = (text: string): string => {
    // Extract direct URLs
    const directUrl = text.match(/https?:\/\/[^\s]+/i)
    if (directUrl) return directUrl[0]
    
    // Extract domain from natural language
    const naturalPatterns = [
      /create.*like\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /similar.*to\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /based.*on\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /replicate\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    ]
    
    for (const pattern of naturalPatterns) {
      const match = text.match(pattern)
      if (match) {
        const domain = match[1]
        return domain.startsWith('http') ? domain : `https://${domain}`
      }
    }
    
    // Extract from copy/clone patterns
    const copyPattern = text.match(/(?:copy|clone)\s+(https?:\/\/[^\s]+)/i)
    if (copyPattern) return copyPattern[1]
    
    // Simple domain pattern
    const domainPattern = text.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/i)
    if (domainPattern) {
      return `https://${domainPattern[0]}`
    }
    
    return text // fallback
  }

  // Helper function to convert file to base64 - FIXED for PDF
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // For PDFs, ensure we have clean base64 without data URL prefix
        if (file.type === 'application/pdf') {
          const base64 = result.split(',')[1] // Remove data:application/pdf;base64, prefix
          resolve(base64)
        } else {
          resolve(result) // Keep full data URL for images
        }
      }
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    setInputValue(textarea.value)
    
    // Auto-resize
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  // Handle URL input
  const handleURLSubmit = () => {
    if (urlValue.trim()) {
      const cleanUrl = extractURL(urlValue.trim())
      router.push(`/dashboard?mode=url&url=${encodeURIComponent(cleanUrl)}`)
      setUrlValue('')
      setShowURLInput(false)
      setShowPopup(false)
    }
  }

  const handleURLKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleURLSubmit()
    }
  }

  // Handle file attachment
  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileName = files[0].name
      setInputValue(`📎 ${fileName} attached`)
      
      // Automatically trigger form generation for file uploads
      setIsSubmitting(true)
      
      try {
        const fileType = files[0].type
        const fileData = await fileToBase64(files[0])
        
        // Store file in sessionStorage for dashboard
        sessionStorage.setItem('uploadedFile', JSON.stringify({
          name: fileName,
          type: fileType,
          data: fileData,
          isPDF: fileType === 'application/pdf'
        }))
        
        // Navigate to dashboard with appropriate mode
        if (fileType === 'application/pdf') {
          router.push(`/dashboard?mode=pdf&filename=${encodeURIComponent(fileName)}`)
        } else if (fileType.startsWith('image/')) {
          router.push(`/dashboard?mode=image&filename=${encodeURIComponent(fileName)}`)
        }
      } catch (error) {
        console.error('File upload error:', error)
        setIsSubmitting(false)
      }
    }
  }



  // Main submit handler with hybrid detection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() && !fileInputRef.current?.files?.length) return

    setIsSubmitting(true)
    
    try {
      const files = fileInputRef.current?.files
      const text = inputValue.trim()
      
      // 1. FILE DETECTION (highest priority)
      if (files && files.length > 0) {
        const fileType = files[0].type
        const fileName = files[0].name
        
        if (fileType === 'application/pdf') {
          router.push(`/dashboard?mode=pdf&filename=${encodeURIComponent(fileName)}`)
        } else if (fileType.startsWith('image/')) {
          router.push(`/dashboard?mode=image&filename=${encodeURIComponent(fileName)}`)
        }
        
        // Store file in sessionStorage for dashboard - FIXED PDF format
        const fileData = await fileToBase64(files[0])
        sessionStorage.setItem('uploadedFile', JSON.stringify({
          name: fileName,
          type: fileType,
          data: fileData,
          isPDF: fileType === 'application/pdf' // Flag for dashboard
        }))
        
      // 2. URL DETECTION (second priority)
      } else if (isURLInput(text)) {
        const cleanUrl = extractURL(text)
        router.push(`/dashboard?mode=url&url=${encodeURIComponent(cleanUrl)}`)
        
      // 3. TEXT INPUT (fallback)
      } else if (text) {
        router.push(`/dashboard?input=${encodeURIComponent(text)}`)
      }
      
    } catch (error) {
      console.error('Navigation error:', error)
      setIsSubmitting(false)
    }
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const hasContent = inputValue.trim() || (fileInputRef.current?.files?.length ?? 0) > 0
  const isURL = isURLInput(inputValue.trim())

  return (
    <div className="landing-container">
      {/* Background elements */}
      <div className="bg-animation">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <div className="page-container">
        {/* Navigation */}
        <nav className="nav">
          <Link href="/" className="logo">
            ChatterForms
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#examples">Examples</a>
            <a href="#pricing">Pricing</a>
            <a href="#" className="sign-up-btn">Sign Up</a>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="hero">
          <div className="hero-badge">
            No more drag - drop, just chatter
          </div>
          
          <h1 className="hero-title">
            Create forms with AI
          </h1>
          
          <p className="hero-subtitle">
            Describe it. Customize it. Publish it.
          </p>

          {/* Main Input Form */}
          <form className="input-section" onSubmit={handleSubmit}>
            <div className="input-container">
              <div className="input-wrapper">
                <textarea 
                  ref={textareaRef}
                  className="main-input"
                  placeholder={inputValue ? "Type your form description..." : currentPlaceholder}
                  rows={1}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  style={{
                    color: isURL ? '#2563eb' : '#1f2937'
                  }}
                />
                
                {/* Plus Button */}
                <div className={plusButtonStyles.plusButtonContainer} ref={popupRef}>
                  <button 
                    type="button"
                    className={`${plusButtonStyles.plusButton} ${showPopup ? plusButtonStyles.active : ''}`}
                    onClick={() => setShowPopup(!showPopup)}
                    disabled={isSubmitting}
                  >
                    {showPopup ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    )}
                  </button>
                  
                  {/* Popup Menu */}
                  <div className={`${plusButtonStyles.popupMenu} ${showPopup ? plusButtonStyles.visible : ''}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowURLInput(true)
                        setShowPopup(false)
                      }}
                      className={plusButtonStyles.menuItem}
                    >
                      <span className={plusButtonStyles.menuIcon}>🔗</span>
                      <span className={plusButtonStyles.menuText}>Clone from URL</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        handleAttachClick()
                        setShowPopup(false)
                      }}
                      className={plusButtonStyles.menuItem}
                    >
                      <span className={plusButtonStyles.menuIcon}>📎</span>
                      <span className={plusButtonStyles.menuText}>Extract from PDF/Image</span>
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className={`submit-btn ${hasContent ? 'active' : ''}`}
                  disabled={!hasContent || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="spinner" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                    </svg>
                  )}
                </button>
                
                {!inputValue && isTyping && (
                  <div className="typing-cursor" />
                )}
              </div>
            </div>


          </form>

          {/* URL Input Modal */}
          {showURLInput && (
            <div className="url-input-modal">
              <div className="url-input-card">
                <div className="url-input-header">
                  <h3>🔗 Clone from URL</h3>
                  <button 
                    type="button"
                    onClick={() => setShowURLInput(false)}
                    className="close-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                <div className="url-input-content">
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    onKeyPress={handleURLKeyPress}
                    placeholder="https://forms.google.com/d/xyz... or any form URL"
                    className="url-input"
                    autoFocus
                  />
                  
                  <button
                    type="button"
                    onClick={handleURLSubmit}
                    disabled={!urlValue.trim()}
                    className="url-submit-btn"
                  >
                    Clone from URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="features">
            <div className="feature-card">
              <span className="feature-icon">🎨</span>
              <h3 className="feature-title">Live Customization</h3>
              <p className="feature-desc">
                Change colors, fonts, and layout in real-time. See your form transform as you design.
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3 className="feature-title">Instant Publishing</h3>
              <p className="feature-desc">
                Get a shareable link immediately. No hosting, databases, or configuration needed.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        className="file-input" 
        accept="image/*,.pdf" 
        multiple
        onChange={handleFileChange}
      />
    </div>
  )
}