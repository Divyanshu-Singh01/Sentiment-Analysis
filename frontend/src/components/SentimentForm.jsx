import React, { useRef, useState } from 'react'
import {
  Paperclip,
  FileSpreadsheet,
  X,
  ArrowUp,
  Loader2,
} from 'lucide-react'
import { cn } from '../lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.csv', '.tsv', '.xlsx']
const MAX_CHARS = 500

export function SentimentForm({
  text,
  setText,
  selectedFile,
  setSelectedFile,
  onSubmit,
  isLoading,
  onError,
}) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (!file) return null
    const ext = `.${file.name.split('.').pop().toLowerCase()}`
    if (!ALLOWED_EXTENSIONS.includes(ext)) return 'Only .csv and .xlsx files are supported.'
    if (file.size > MAX_FILE_SIZE) return 'File too large (max 5 MB).'
    if (file.size === 0) return 'File is empty.'
    return null
  }

  const handleFileSelection = (file) => {
    onError?.(null)
    const err = validateFile(file)
    if (err) { onError?.(err); return }
    setSelectedFile(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0])
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!isLoading && (text.trim() || selectedFile)) onSubmit()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isLoading && (text.trim() || selectedFile)) onSubmit()
  }

  const handleChange = (e) => {
    const val = e.target.value
    if (val.length <= MAX_CHARS) setText(val)
  }

  const canSubmit = !isLoading && (text.trim() || selectedFile)

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative w-full rounded-2xl bg-white border transition-all duration-200',
          dragActive
            ? 'border-2 border-dashed border-blue-600 bg-blue-50/20'
            : 'border-neutral-200 shadow-xs hover:border-neutral-300 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/15 focus-within:shadow-[0_4px_24px_-4px_rgba(59,130,246,0.12)]'
        )}
      >
        {/* Drag overlay */}
        {dragActive && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/90 pointer-events-none rounded-2xl">
            <p className="text-sm text-black font-medium">Drop file here</p>
          </div>
        )}

        {/* Attached file chip */}
        {selectedFile && (
          <div className="mx-3 mt-3 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
            <FileSpreadsheet className="h-3.5 w-3.5 text-neutral-600" />
            <span className="text-black font-medium truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</span>
            <span className="text-neutral-400">{(selectedFile.size / 1024).toFixed(0)} KB</span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-0.5 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          id="sentiment-input"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={MAX_CHARS}
          rows={selectedFile ? 2 : 3}
          placeholder={selectedFile ? 'Optional notes...' : 'Enter text to analyze sentiment...'}
          disabled={isLoading}
          className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-black placeholder:text-neutral-400 outline-none resize-none disabled:opacity-50 caret-black"
        />

        {/* Bottom toolbar */}
        <div className="px-3 pb-2.5 flex items-center justify-between gap-2">
          {/* Left: attach */}
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.tsv"
              onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-40"
              title="Attach spreadsheet"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>

          {/* Right: counter + submit */}
          <div className="flex items-center gap-2.5">
            {text.length > 0 && !selectedFile && (
              <span className="text-[11px] font-mono text-neutral-400 select-none">
                {text.length}/{MAX_CHARS}
              </span>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default',
                canSubmit
                  ? 'bg-black text-white hover:bg-neutral-800 shadow-xs'
                  : 'bg-neutral-100 text-neutral-400'
              )}
            >
              {isLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ArrowUp className="h-4 w-4" />
              }
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
