import { useState, useEffect } from 'react'

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
    icon: "🏥",
    title: "Patient Intake Form",
    description: "Medical history, insurance, contact details",
    prompt: "Create a comprehensive patient intake form with personal information, medical history, current medications, insurance details, and emergency contact information."
  },
  {
    icon: "💼",
    title: "Job Application",
    description: "Experience, skills, resume upload",
    prompt: "Build a job application form with personal details, work experience, education, skills assessment, and resume upload functionality."
  },
  {
    icon: "📋",
    title: "Event Registration",
    description: "Attendee info, preferences, payment",
    prompt: "Design an event registration form with attendee information, dietary preferences, accommodation needs, and payment processing."
  },
  {
    icon: "📝",
    title: "Customer Survey",
    description: "Feedback, ratings, suggestions",
    prompt: "Generate a customer feedback survey with rating scales, multiple choice questions, and open-ended feedback sections."
  },
  {
    icon: "🎓",
    title: "Course Enrollment",
    description: "Student info, course selection, payment",
    prompt: "Create a course enrollment form with student information, course selection, prerequisites check, and payment details."
  },
  {
    icon: "🏡",
    title: "Property Inquiry",
    description: "Contact info, preferences, budget",
    prompt: "Build a real estate inquiry form with contact information, property preferences, budget range, and viewing schedule."
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
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="enhanced-empty-state"
    >
      {/* Animated background elements */}
      <div className="floating-elements">
        <div className="float-element" style={{ top: '20%', left: '15%', animationDelay: '0s' }}>📝</div>
        <div className="float-element" style={{ top: '30%', right: '20%', animationDelay: '1s' }}>📋</div>
        <div className="float-element" style={{ bottom: '30%', left: '10%', animationDelay: '2s' }}>✨</div>
        <div className="float-element" style={{ bottom: '20%', right: '15%', animationDelay: '3s' }}>🎨</div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-icon">🚀</div>
          <h1 className="hero-title">Ready to create your form?</h1>
          <p className="hero-subtitle">
            Describe what you need, upload an existing form, or get inspired by our examples below
          </p>
        </div>

        {/* Featured Example with rotation */}
        <div className="featured-example">
          <div className="example-header">
            <span className="example-badge">💡 Try this example</span>
          </div>
          
          <div className={`example-card ${isAnimating ? 'animating' : ''}`}>
            <div className="example-icon">{currentExample.icon}</div>
            <div className="example-content">
              <h3 className="example-title">{currentExample.title}</h3>
              <p className="example-description">{currentExample.description}</p>
            </div>
            <button 
              className="try-example-btn"
              onClick={() => onExampleClick?.(currentExample.prompt)}
            >
              Try this →
            </button>
          </div>

          {/* Example indicators */}
          <div className="example-indicators">
            {FORM_EXAMPLES.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentExampleIndex ? 'active' : ''}`}
                onClick={() => setCurrentExampleIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Quick Examples Grid */}
        <div className="quick-examples">
          <h3 className="examples-title">Or browse more examples:</h3>
          <div className="examples-grid">
            {FORM_EXAMPLES.map((example, index) => (
              <button
                key={index}
                className={`example-chip ${index === currentExampleIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentExampleIndex(index)
                  onExampleClick?.(example.prompt)
                }}
              >
                <span className="chip-icon">{example.icon}</span>
                <span className="chip-text">{example.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Getting Started Steps */}
        <div className="getting-started">
          <h3 className="steps-title">How it works:</h3>
          <div className="steps-list">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <span className="step-title">Describe or Upload</span>
                <span className="step-description">Tell us what you need or upload an existing form</span>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <span className="step-title">AI Generates</span>
                <span className="step-description">Our AI creates your form in seconds</span>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <span className="step-title">Customize & Publish</span>
                <span className="step-description">Fine-tune and share your form instantly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .enhanced-empty-state {
          position: relative;
          text-align: center;
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .float-element {
          position: absolute;
          font-size: 24px;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .main-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
          width: 100%;
        }

        /* Hero Section */
        .hero-section {
          margin-bottom: 48px;
        }

        .hero-icon {
          font-size: 64px;
          margin-bottom: 24px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .hero-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          color: ${stylingConfig.fontColor};
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 18px;
          color: ${stylingConfig.fontColor};
          opacity: 0.7;
          line-height: 1.5;
          margin-bottom: 0;
        }

        /* Featured Example */
        .featured-example {
          margin-bottom: 48px;
        }

        .example-header {
          margin-bottom: 16px;
        }

        .example-badge {
          display: inline-block;
          background: linear-gradient(135deg, ${stylingConfig.buttonColor}20, ${stylingConfig.buttonColor}10);
          color: ${stylingConfig.buttonColor};
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid ${stylingConfig.buttonColor}30;
        }

        .example-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .example-card:hover {
          border-color: ${stylingConfig.buttonColor}50;
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .example-card.animating {
          opacity: 0.7;
          transform: scale(0.98);
        }

        .example-icon {
          font-size: 32px;
          width: 56px;
          height: 56px;
          background: ${stylingConfig.buttonColor}20;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .example-content {
          flex: 1;
          text-align: left;
        }

        .example-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
          color: ${stylingConfig.fontColor};
        }

        .example-description {
          font-size: 14px;
          color: ${stylingConfig.fontColor};
          opacity: 0.7;
          margin: 0;
        }

        .try-example-btn {
          background: ${stylingConfig.buttonColor};
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .try-example-btn:hover {
          background: ${stylingConfig.buttonColor}dd;
          transform: translateX(2px);
        }

        .example-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: ${stylingConfig.fontColor}30;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .indicator.active {
          background: ${stylingConfig.buttonColor};
          transform: scale(1.2);
        }

        /* Quick Examples Grid */
        .quick-examples {
          margin-bottom: 48px;
        }

        .examples-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
          color: ${stylingConfig.fontColor};
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .example-chip {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .example-chip:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: ${stylingConfig.buttonColor}40;
          transform: translateY(-2px);
        }

        .example-chip.active {
          background: ${stylingConfig.buttonColor}15;
          border-color: ${stylingConfig.buttonColor}50;
        }

        .chip-icon {
          font-size: 20px;
        }

        .chip-text {
          font-size: 12px;
          font-weight: 500;
          color: ${stylingConfig.fontColor};
          opacity: 0.9;
        }

        /* Getting Started Steps */
        .getting-started {
          margin-top: 48px;
        }

        .steps-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 24px;
          color: ${stylingConfig.fontColor};
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: left;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: ${stylingConfig.buttonColor};
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .step-title {
          font-weight: 600;
          font-size: 14px;
          color: ${stylingConfig.fontColor};
        }

        .step-description {
          font-size: 12px;
          color: ${stylingConfig.fontColor};
          opacity: 0.7;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-content {
            padding: 0 20px;
          }

          .hero-title {
            font-size: 28px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .example-card {
            flex-direction: column;
            text-align: center;
          }

          .example-content {
            text-align: center;
          }

          .examples-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 8px;
          }

          .steps-list {
            gap: 12px;
          }

          .step {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  )
}