// Shared types for the dashboard components

export type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'checkbox-group' | 'radio-with-other' | 'checkbox-with-other'

export type SizeType = 'xs' | 's' | 'm' | 'l' | 'xl'

export interface FieldExtraction {
  id: string
  label: string
  type: FieldType
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
  pageNumber?: number
  additionalContext?: string
}

export interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  size?: SizeType
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
}

export interface FormSchema {
  title: string
  fields: FormField[]
  formId?: string
  styling?: {
    globalFontSize?: SizeType
    fieldSizes?: Record<string, SizeType>
    fontFamily?: string
    fontColor?: string
    backgroundColor?: string
    buttonColor?: string
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'thinking' | 'processing' | 'file' | 'analysisAction' | 'fieldResults'
  content: string
  timestamp?: number
  metadata?: {
    duration?: number
    steps?: string[]
    isComplete?: boolean
    // File message metadata
    fileType?: 'image' | 'pdf' | 'url'
    fileName?: string
    fileData?: string // base64 for images, URL for web pages
    isUpload?: boolean
    isAnalysisAction?: boolean
    // Field results metadata
    extractedFields?: FieldExtraction[]
    onGenerateForm?: () => void
  }
}

export interface PDFPageInfo {
  page: number
  url: string
  filename: string
}

export interface PDFPageSelectionResponse {
  needsPageSelection: boolean
  uuid: string
  totalPages: number
  pages: PDFPageInfo[]
  message: string
}

export interface StylingConfig {
  fontFamily: string
  fontColor: string
  backgroundColor: string
  buttonColor: string
}

export interface SizeConfig {
  globalFontSize: SizeType
  fieldSizes: Record<string, SizeType>
}