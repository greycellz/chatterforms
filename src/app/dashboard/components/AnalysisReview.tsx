import { useState } from 'react'
import PDFPageSelector from './PDFPageSelector'
import AnalysisProgress from './AnalysisProgress'
import FilePreview from './FilePreview'
import FieldResults from './FieldResults'
import { FieldExtraction, PDFPageSelectionResponse } from '../types'

interface AnalysisReviewProps {
  uploadedImage: string | null
  uploadedPDF: File | null
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onAnalyzeImage: (additionalContext?: string) => void
  onAnalyzePDF: (file: File, additionalContext?: string, pageSelection?: { pages: number[], selectAll?: boolean }) => void
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
  
  // PDF page selection props
  pdfPageSelection?: PDFPageSelectionResponse | null
  onPageSelectionComplete?: (pageSelection: { pages: number[], selectAll?: boolean }) => void
}

export default function AnalysisReview({
  uploadedImage,
  uploadedPDF,
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onAnalyzeImage,
  onAnalyzePDF,
  onFieldsValidated,
  onResetAnalysis,
  pdfPageSelection,
  onPageSelectionComplete
}: AnalysisReviewProps) {
  const [additionalContext, setAdditionalContext] = useState('')

  const fileType = uploadedPDF ? 'PDF' : 'Image'
  const fileName = uploadedPDF?.name || 'screenshot'

  // Don't render if no workflow is active
  if (!uploadedImage && !uploadedPDF && !analysisComplete && !pdfPageSelection) {
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
        fileName={fileName}
      />
    )
  }

  // Upload context input (before analysis)
  if ((uploadedImage || uploadedPDF) && !analysisComplete && !isAnalyzing) {
    return (
      <FilePreview
        fileType={fileType}
        fileName={fileName}
        uploadedPDF={uploadedPDF}
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
        fileName={fileName}
        onFieldsValidated={onFieldsValidated}
        onResetAnalysis={onResetAnalysis}
      />
    )
  }

  return null
}