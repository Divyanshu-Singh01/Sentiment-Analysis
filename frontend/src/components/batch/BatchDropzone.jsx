import React, { useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet, AlertCircle, X, Loader2, Sparkles, Download } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_EXTENSIONS = ['.csv', '.tsv', '.xlsx']

const SAMPLE_CSV_CONTENT = `review_id,customer_name,review_text,date
1,Aarav Sharma,"The food was delivered piping hot and within 20 minutes, absolutely loved it!",2026-09-01
2,Priya Patel,"Very bad experience, driver was rude and overcharged for the trip.",2026-09-01
3,Rohan Verma,"Service was fine, nothing special to complain about.",2026-09-02
4,Neha Gupta,"The phone camera is stunning however the battery drains in 4 hours.",2026-09-02
5,Vikram Singh,"bhai doctor ne time pe dekha aur dawai bhi sahi di, highly satisfied!",2026-09-03
6,Ananya Roy,"ye product toh sach me kamaal ka hai, quality top notch hai.",2026-09-03
7,Rahul Nair,"bohot bura customer support, 3 din se issue pending hai.",2026-09-03
8,Sneha Kulkarni,"ok product does the job for the price.",2026-09-04
9,Amitabh Das,"I would definitely recommend this banking app to everyone, instant UPI transfer.",2026-09-04
10,Divya Iyer,"Not to complain but the broadband connection drops every evening.",2026-09-05
11,Karan Joshi,"यह उत्पाद बहुत ही बेहतरीन है, गुणवत्ता शानदार है।",2026-09-05
12,Pooja Bhatia,"chalega koi baat nhi normal product tha.",2026-09-06
13,Suresh Reddy,"What is the point of paying for fast delivery if it takes 3 days?",2026-09-06
14,Meera Sen,"Great atmosphere and friendly staff at the hotel!",2026-09-06
15,Harsh Vardhan,"Horrible packaging, items arrived broken and leaked everywhere.",2026-09-07
16,Ishita Malik,"Packaging was clean and delivery was on time.",2026-09-07
17,Gaurav Chopra,"bhai UPI payment instant hua koi dikkat nhi hui.",2026-09-08
18,Tanya Saxena,"I wish I could say something positive but the quality has really gone down.",2026-09-08
19,Kunal Mehra,"average service as expected for a budget option.",2026-09-08
20,Ritu Agarwal,"The course content was engaging but the audio quality was muffled.",2026-09-09`

export function BatchDropzone({ onAnalyze, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [customColumn, setCustomColumn] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const inputRef = useRef(null)

  const validateAndSelectFile = (file) => {
    setValidationError(null)

    if (!file) return

    const ext = `.${file.name.split('.').pop().toLowerCase()}`
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError('Unsupported format. Please upload a .csv or .xlsx spreadsheet.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File exceeds maximum size of 5 MB (size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`)
      return
    }

    if (file.size === 0) {
      setValidationError('Uploaded file is empty (0 bytes).')
      return
    }

    setSelectedFile(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0])
    }
  }

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'sample_reviews.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setValidationError('Please select a file to analyze.')
      return
    }
    onAnalyze(selectedFile, customColumn.trim())
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-black tracking-tight">Upload Spreadsheet</h2>
            <p className="text-xs text-neutral-600 mt-0.5">Accepts CSV and Excel (.xlsx) up to 2,000 rows & 5 MB</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-black bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-full border border-neutral-200 transition-all cursor-pointer shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-black" aria-hidden="true" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            dragActive
              ? 'border-black bg-neutral-50'
              : selectedFile
              ? 'border-neutral-300 bg-neutral-50'
              : 'border-neutral-200 hover:border-black bg-white hover:bg-neutral-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.tsv,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="h-12 w-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-black truncate max-w-[280px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-neutral-500 font-mono font-medium">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                  setValidationError(null)
                  if (inputRef.current) inputRef.current.value = ''
                }}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-medium px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100/70 border border-rose-200 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                <span>Remove File</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-black">
                  Drag and drop your file here, or <span className="text-black font-semibold underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Supported formats: <span className="font-semibold text-black">.CSV</span>, <span className="font-semibold text-black">.TSV</span>, <span className="font-semibold text-black">.XLSX</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs animate-result-in"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Optional Custom Column Input */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-0.5">
            <label htmlFor="custom-column-input" className="text-xs font-medium text-black block">
              Review Column Override <span className="text-xs text-neutral-500 font-normal">(Optional)</span>
            </label>
            <p className="text-[11px] text-neutral-500">
              Leave empty to automatically detect columns named <em>review</em>, <em>text</em>, <em>feedback</em>, or <em>comment</em>.
            </p>
          </div>
          <input
            id="custom-column-input"
            type="text"
            value={customColumn}
            onChange={(e) => setCustomColumn(e.target.value)}
            placeholder="e.g. customer_comments"
            className="w-full sm:w-60 h-10 px-3 py-2 text-xs sm:text-[13px] rounded-xl border border-neutral-200 bg-white text-black placeholder:text-neutral-400 outline-none focus:border-black focus:ring-1 focus:ring-black caret-black transition-all"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-6 font-semibold text-sm sm:text-base text-white bg-black hover:bg-neutral-800 active:bg-neutral-900 shadow-xs transition-colors cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
                <span>Analyzing spreadsheet rows in real-time...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
                <span>Start Bulk Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
