import { useState } from 'react'
import { PDFPageSelectionResponse } from '../types'

interface PDFPageSelectorProps {
  pdfPageSelection: PDFPageSelectionResponse
  onPageSelectionComplete: (pageSelection: { pages: number[], selectAll?: boolean }) => void
  onResetAnalysis: () => void
}

export default function PDFPageSelector({
  pdfPageSelection,
  onPageSelectionComplete,
  onResetAnalysis
}: PDFPageSelectorProps) {
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [additionalContext, setAdditionalContext] = useState('')

  return (
    <div className="p-4 space-y-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          📄 Select Pages to Analyze
        </h3>
        <button
          onClick={onResetAnalysis}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Start Over
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          Your PDF has <strong>{pdfPageSelection.totalPages} pages</strong>. 
          Select up to 10 pages to analyze in this batch.
        </p>
      </div>

      {/* Select All Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => {
              const checked = e.target.checked
              setSelectAll(checked)
              if (checked) {
                // Select first 10 pages
                const firstTenPages = pdfPageSelection.pages.slice(0, 10).map(p => p.page)
                setSelectedPages(firstTenPages)
              } else {
                setSelectedPages([])
              }
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Select first 10 pages
          </span>
        </label>
        
        <div className="text-xs text-gray-500">
          {selectedPages.length}/10 pages selected
        </div>
      </div>

      {/* Page Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {pdfPageSelection.pages.map((pageInfo) => (
          <div
            key={pageInfo.page}
            className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all ${
              selectedPages.includes(pageInfo.page)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              if (selectedPages.includes(pageInfo.page)) {
                // Remove page
                setSelectedPages(prev => prev.filter(p => p !== pageInfo.page))
                setSelectAll(false)
              } else if (selectedPages.length < 10) {
                // Add page (max 10)
                setSelectedPages(prev => [...prev, pageInfo.page].sort((a, b) => a - b))
              }
            }}
          >
            {/* Selection indicator */}
            {selectedPages.includes(pageInfo.page) && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Page preview */}
            <div className="aspect-[3/4] bg-gray-100 rounded border mb-2 overflow-hidden">
              <img
                src={pageInfo.url}
                alt={`Page ${pageInfo.page}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Page info */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                Page {pageInfo.page}
              </div>
              <div className="text-xs text-gray-500">
                {pageInfo.filename}
              </div>
            </div>

            {/* Disabled overlay for max selection */}
            {!selectedPages.includes(pageInfo.page) && selectedPages.length >= 10 && (
              <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-xs text-white font-medium bg-gray-800 px-2 py-1 rounded">
                  Max 10 pages
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Context input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional context (optional):
        </label>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="e.g., This is a medical intake form, focus on patient information sections..."
          className="w-full h-20 p-3 text-sm bg-white text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
        />
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            if (selectedPages.length > 0) {
              onPageSelectionComplete({ pages: selectedPages, selectAll })
            }
          }}
          disabled={selectedPages.length === 0}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          Analyze Selected Pages ({selectedPages.length})
        </button>
      </div>
    </div>
  )
}