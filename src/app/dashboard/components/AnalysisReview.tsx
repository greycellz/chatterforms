import { useState } from 'react'
import PDFPageSelector from './PDFPageSelector'
import AnalysisProgress from './AnalysisProgress'
import FilePreview from './FilePreview'
import FieldResults from './FieldResults'
import { FieldExtraction, PDFPageSelectionResponse } from '../types'

interface AnalysisReviewProps {
  uploadedImage: string | null
  uploadedPDF: File | null
  uploadedURL: string | null // New URL prop
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onAnalyzeImage: (additionalContext?: string) => void
  onAnalyzePDF: (file: File, additionalContext?: string, pageSelection?: { pages: number[], selectAll?: boolean }) => void
  onAnalyzeURL: (url: string, additionalContext?: string) => void // New URL analyzer
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
  
  // PDF page selection props
  pdfPageSelection?: PDFPageSelectionResponse | null
  onPageSelectionComplete?: (pageSelection: { pages: number[], selectAll?: boolean }) => void
}

export default function AnalysisReview({
  uploadedImage,
  uploadedPDF,
  uploadedURL, // New URL prop
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onAnalyzeImage,
  onAnalyzePDF,
  onAnalyzeURL, // New URL analyzer
  onFieldsValidated,
  onResetAnalysis,
  pdfPageSelection,
  onPageSelectionComplete
}: AnalysisReviewProps) {
  const [additionalContext, setAdditionalContext] = useState('')

  const fileType = uploadedPDF ? 'PDF' : uploadedURL ? 'URL' : 'Image'
  const fileName = uploadedPDF?.name || uploadedURL || 'screenshot'

  // Don't render if no workflow is active
  if (!uploadedImage && !uploadedPDF && !uploadedURL && !analysisComplete && !pdfPageSelection) {
    return null
  }

  // PDF Page Selection UI
  if (pdfPageSelection?.needsPageSelection && onPageSelectionComplete) {
    return (
      <PDFPageSelector
        pdfPageSelection={pdfPageSelection}
        onPageSelectionComplete={onPageSelectionComplete}
        onResetAnalysis={onResetAnalysis}
      />
    )
  }

  // Analysis in progress
  if (isAnalyzing) {
    return (
      <AnalysisProgress
        uploadedPDF={uploadedPDF}
        uploadedURL={uploadedURL} // Pass URL for proper messaging
        fileName={fileName}
      />
    )
  }

  // Upload context input (before analysis) - Skip intermediate step for URLs
  if ((uploadedImage || uploadedPDF) && !analysisComplete && !isAnalyzing) {
    return (
      <FilePreview
        fileType={fileType}
        fileName={fileName}
        uploadedPDF={uploadedPDF}
        uploadedURL={uploadedURL} // Pass URL state
        additionalContext={additionalContext}
        onContextChange={setAdditionalContext}
        onAnalyze={() => {
          if (uploadedPDF) {
            onAnalyzePDF(uploadedPDF, additionalContext)
          } else {
            onAnalyzeImage(additionalContext)
          }
        }}
        isAnalyzing={isAnalyzing}
      />
    )
  }

  // Analysis complete - show field review or no results
  if (analysisComplete) {
    return (
      <FieldResults
        extractedFields={extractedFields}
        uploadedImage={uploadedImage}
        uploadedPDF={uploadedPDF}
        uploadedURL={uploadedURL} // Pass URL state
        fileName={fileName}
        onFieldsValidated={onFieldsValidated}
        onResetAnalysis={onResetAnalysis}
      />
    )
  }

  return null
}