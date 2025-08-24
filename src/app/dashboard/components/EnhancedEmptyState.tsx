import { useState, useEffect } from 'react'
import styles from './EnhancedEmptyState.module.css'

interface EnhancedEmptyStateProps {
  stylingConfig: {
    fontFamily: string
    fontColor: string
    backgroundColor: string
    buttonColor: string
  }
  onExampleClick?: (example: string) => void
  // Analysis complete state props
  analysisComplete?: boolean
  extractedFields?: any[]
  onGenerateFormFromFields?: () => void
}

const FORM_EXAMPLES = [
  {
    title: "Patient Intake Form",
    description: "Medical history, insurance, contact details",
    prompt: "Create a comprehensive patient intake form with personal information, medical history, current medications, insurance details, and emergency contact information.",
    category: "Healthcare",
    color: "#8B5CF6"
  },
  {
    title: "Job Application",
    description: "Experience, skills, resume upload",
    prompt: "Build a job application form with personal details, work experience, education, skills assessment, and resume upload functionality.",
    category: "Employment",
    color: "#06B6D4"
  },
  {
    title: "Event Registration",
    description: "Attendee info, preferences, payment",
    prompt: "Design an event registration form with attendee information, dietary preferences, accommodation needs, and payment processing.",
    category: "Events",
    color: "#10B981"
  },
  {
    title: "Customer Survey",
    description: "Feedback, ratings, suggestions",
    prompt: "Generate a customer feedback survey with rating scales, multiple choice questions, and open-ended feedback sections.",
    category: "Business",
    color: "#F59E0B"
  },
  {
    title: "Course Enrollment",
    description: "Student info, course selection, payment",
    prompt: "Create a course enrollment form with student information, course selection, prerequisites check, and payment details.",
    category: "Education",
    color: "#EF4444"
  },
  {
    title: "Property Inquiry",
    description: "Contact info, preferences, budget",
    prompt: "Build a real estate inquiry form with contact information, property preferences, budget range, and viewing schedule.",
    category: "Real Estate",
    color: "#8B5CF6"
  }
]

// Analysis Complete State Component
const AnalysisCompleteState = ({ 
  stylingConfig, 
  extractedFields, 
  onGenerateFormFromFields 
}: { 
  stylingConfig: any
  extractedFields?: any[]
  onGenerateFormFromFields?: () => void 
}) => {
  const fieldCount = extractedFields?.length || 0
  
  return (
    <div 
      style={{
        background: stylingConfig.backgroundColor,
        fontFamily: stylingConfig.fontFamily,
        color: stylingConfig.fontColor,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Main Content */}
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>
        
        {/* Title */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Your analysis is complete!
        </h2>
        
        {/* Description */}
        <p style={{
          fontSize: '18px',
          opacity: '0.8',
          marginBottom: '48px',
          lineHeight: '1.6'
        }}>
          Select &apos;Generate Form&apos; from the extracted fields above to create your form
        </p>
        
        {/* Generate Form Button */}
        <button
          onClick={onGenerateFormFromFields}
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          Generate Form ({fieldCount} fields)
        </button>
      </div>
    </div>
  )
}

export default function EnhancedEmptyState({ 
  stylingConfig, 
  onExampleClick, 
  analysisComplete, 
  extractedFields, 
  onGenerateFormFromFields 
}: EnhancedEmptyStateProps) {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Auto-rotate examples
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentExampleIndex((prev) => (prev + 1) % FORM_EXAMPLES.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const currentExample = FORM_EXAMPLES[currentExampleIndex]

  // Show analysis complete state if analysis is done
  if (analysisComplete) {
    return (
      <AnalysisCompleteState 
        stylingConfig={stylingConfig}
        extractedFields={extractedFields}
        onGenerateFormFromFields={onGenerateFormFromFields}
      />
    )
  }

  return (
    <div 
      style={{
        background: stylingConfig.backgroundColor,
        fontFamily: stylingConfig.fontFamily,
        color: stylingConfig.fontColor,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className={styles.enhancedEmptyState}
    >
      {/* Subtle background pattern */}
      <div className={styles.backgroundPattern}>
        <div className={styles.patternDot} style={{ top: '15%', left: '10%' }}></div>
        <div className={styles.patternDot} style={{ top: '25%', right: '15%' }}></div>
        <div className={styles.patternDot} style={{ bottom: '20%', left: '20%' }}></div>
        <div className={styles.patternDot} style={{ bottom: '30%', right: '10%' }}></div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Ready to create your form?</h1>
          <p className={styles.heroSubtitle}>
            Describe what you need, upload an existing form, or get inspired by our templates below
          </p>
        </div>

        {/* Featured Example with rotation */}
        <div className={styles.featuredExample}>
          <div className={styles.exampleHeader}>
            <span className={styles.exampleBadge}>Featured Template</span>
          </div>
          
          <div 
            className={`${styles.exampleCard} ${isAnimating ? styles.animating : ''}`}
            onClick={() => onExampleClick?.(currentExample.prompt)}
          >
            <div 
              className={styles.examplePreview}
              style={{ background: currentExample.color }}
            >
              <div className={styles.previewContent}>
                <div className={styles.previewField}></div>
                <div className={styles.previewField}></div>
                <div className={styles.previewField}></div>
              </div>
            </div>
            <div className={styles.exampleContent}>
              <div className={styles.exampleCategory}>{currentExample.category}</div>
              <h3 className={styles.exampleTitle}>{currentExample.title}</h3>
              <p className={styles.exampleDescription}>{currentExample.description}</p>
            </div>
          </div>

          {/* Example indicators */}
          <div className={styles.exampleIndicators}>
            {FORM_EXAMPLES.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentExampleIndex ? styles.active : ''}`}
                onClick={() => setCurrentExampleIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Template Categories */}
        <div className={styles.templateCategories}>
          <h3 className={styles.categoriesTitle}>Browse by category:</h3>
          <div className={styles.categoriesGrid}>
            {['Healthcare', 'Business', 'Education', 'Events', 'Employment', 'Real Estate'].map((category) => (
              <button key={category} className={styles.categoryChip}>
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* All Templates Grid */}
        <div className={styles.allTemplates}>
          <h3 className={styles.templatesTitle}>All Templates</h3>
          <div className={styles.templatesGrid}>
            {FORM_EXAMPLES.map((example, index) => (
              <button
                key={index}
                className={`${styles.templateCard} ${index === currentExampleIndex ? styles.active : ''}`}
                onClick={() => onExampleClick?.(example.prompt)}
              >
                <div 
                  className={styles.templatePreview}
                  style={{ background: example.color }}
                >
                  <div className={styles.previewContent}>
                    <div className={styles.previewField}></div>
                    <div className={styles.previewField}></div>
                  </div>
                </div>
                <div className={styles.templateInfo}>
                  <div className={styles.templateCategory}>{example.category}</div>
                  <h4 className={styles.templateTitle}>{example.title}</h4>
                  <p className={styles.templateDescription}>{example.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Getting Started Steps */}
        <div className={styles.gettingStarted}>
          <h3 className={styles.stepsTitle}>How it works</h3>
          <div className={styles.stepsList}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <span className={styles.stepTitle}>Describe or Upload</span>
                <span className={styles.stepDescription}>Tell us what you need or upload an existing form</span>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <span className={styles.stepTitle}>AI Generates</span>
                <span className={styles.stepDescription}>Our AI creates your form in seconds</span>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <span className={styles.stepTitle}>Customize & Publish</span>
                <span className={styles.stepDescription}>Fine-tune and share your form instantly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
