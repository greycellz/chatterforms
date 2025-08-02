interface EditableTextProps {
    text: string
    editKey: string
    className?: string
    onStartEdit: () => void
    isButton?: boolean
    isEditing: boolean
    editValue: string
    onEditValueChange: (value: string) => void
    onSave: () => void
    onCancel: () => void
    style?: React.CSSProperties
  }
  
  export default function EditableText({
    text,
    className = '',
    onStartEdit,
    isButton = false,
    isEditing,
    editValue,
    onEditValueChange,
    onSave,
    onCancel,
    style = {}
  }: EditableTextProps) {
    if (isEditing) {
      if (isButton) {
        // Special styling for button editing to maintain visibility
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave()
              if (e.key === 'Escape') onCancel()
            }}
            className="mt-6 bg-white text-black border-2 border-blue-500 rounded-lg py-2 px-6 focus:outline-none font-medium"
            style={style}
            autoFocus
          />
        )
      }
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave()
            if (e.key === 'Escape') onCancel()
          }}
          className={`${className} bg-white border-2 border-blue-500 rounded px-2 py-1 focus:outline-none`}
          style={{ ...style, color: '#000000' }} // Force black text while editing for visibility
          autoFocus
        />
      )
    }
  
    if (isButton) {
      // Simple button with hover effect - double-click to edit
      return (
        <button
          className={`${className} hover:bg-green-700 transition-colors`}
          onDoubleClick={onStartEdit}
          type="button"
          title="Double-click to edit button text"
          style={style}
        >
          {text}
        </button>
      )
    }
  
    // Regular text elements - double-click to edit with hover effect
    return (
      <div
        className={`${className} cursor-text hover:bg-blue-100 hover:bg-opacity-50 rounded px-2 py-1 transition-colors`}
        onDoubleClick={onStartEdit}
        title="Double-click to edit"
        style={style}
      >
        {text}
      </div>
    )
  }