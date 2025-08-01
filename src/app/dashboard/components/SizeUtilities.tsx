export type SizeType = 'xs' | 's' | 'm' | 'l' | 'xl'

export interface SizeConfig {
  globalFontSize: SizeType
  fieldSizes: Record<string, SizeType>
}

// Get input field size classes
export function getInputSizeClasses(fieldSize: SizeType): string {
  const sizeMap = {
    xs: 'px-2 py-1 text-xs',
    s: 'px-2.5 py-1.5 text-sm',
    m: 'px-3 py-2 text-base',
    l: 'px-4 py-3 text-lg',
    xl: 'px-5 py-4 text-xl'
  }
  
  return sizeMap[fieldSize]
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