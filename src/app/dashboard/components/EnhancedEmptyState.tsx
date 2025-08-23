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

export default function EnhancedEmptyState({ stylingConfig, onExampleClick }: EnhancedEmptyStateProps) {
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
