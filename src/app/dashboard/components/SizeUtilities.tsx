export type SizeType = 'xs' | 's' | 'm' | 'l' | 'xl'

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

// Get input field size classes with WIDTH-based sizing
export function getInputSizeClasses(fieldSize: SizeType): string {
  const sizeMap = {
    // Width-based sizing: xs(25%) → s(40%) → m(60%) → l(80%) → xl(95%)
    xs: 'px-2 py-1.5 text-sm w-1/4', // 25% width
    s: 'px-2.5 py-2 text-sm w-2/5',  // 40% width  
    m: 'px-3 py-2 text-base w-3/5',  // 60% width
    l: 'px-4 py-2.5 text-base w-4/5', // 80% width
    xl: 'px-5 py-3 text-lg w-[95%]'   // 95% width
  }
  
  return sizeMap[fieldSize]
}

// Alternative function for containers that need specific width percentages  
export function getFieldWidthClasses(fieldSize: SizeType): string {
  const widthMap = {
    xs: 'w-1/4',      // 25%
    s: 'w-2/5',       // 40%
    m: 'w-3/5',       // 60%
    l: 'w-4/5',       // 80%  
    xl: 'w-[95%]'     // 95%
  }
  
  return widthMap[fieldSize]
}

// Get input field padding/text size classes (separate from width)
export function getInputPaddingClasses(fieldSize: SizeType): string {
  const paddingMap = {
    xs: 'px-2 py-1.5 text-sm',
    s: 'px-2.5 py-2 text-sm',
    m: 'px-3 py-2 text-base',
    l: 'px-4 py-2.5 text-base',
    xl: 'px-5 py-3 text-lg'
  }
  
  return paddingMap[fieldSize]
}

// Get text size classes (for labels, titles, etc.)
export function getTextSizeClasses(globalSize: SizeType, element: 'title' | 'label' | 'text' = 'text'): string {
  const sizeMap = {
    title: {
      xs: 'text-lg',
      s: 'text-xl',
      m: 'text-2xl',
      l: 'text-3xl',
      xl: 'text-4xl'
    },
    label: {
      xs: 'text-xs',
      s: 'text-sm',
      m: 'text-base',
      l: 'text-lg',
      xl: 'text-xl'
    },
    text: {
      xs: 'text-xs',
      s: 'text-sm',
      m: 'text-base',
      l: 'text-lg',
      xl: 'text-xl'
    }
  }
  
  return sizeMap[element][globalSize]
}

// Get button size classes
export function getButtonSizeClasses(globalSize: SizeType): string {
  const sizeMap = {
    xs: 'px-3 py-1.5 text-xs',
    s: 'px-4 py-2 text-sm',
    m: 'px-6 py-2 text-base',
    l: 'px-8 py-3 text-lg',
    xl: 'px-10 py-4 text-xl'
  }
  
  return sizeMap[globalSize]
}

// Utility function to get field container classes for proper alignment
export function getFieldContainerClasses(): string {
  // Return flex classes to handle alignment when fields are not full width
  return 'flex flex-col items-start'
}