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
    <div className="relative overflow-hidden rounded-2xl border border-[#ecd2be]/80 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(223,135,88,0.12)]">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#ecd2be]/60">
          <div>
            <h2 className="text-xl font-bold text-[#22130b] tracking-tight">Upload Spreadsheet</h2>
            <p className="text-xs text-[#786154]">Accepts CSV and Excel (.xlsx) up to 2,000 rows & 5 MB</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ba4f1a] hover:text-[#993b0a] bg-[#df8758]/10 hover:bg-[#df8758]/20 px-3 py-1.5 rounded-lg border border-[#df8758]/25 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download Sample CSV
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            dragActive
              ? 'border-[#d96526] bg-[#df8758]/10 scale-[1.01]'
              : selectedFile
              ? 'border-[#df8758]/50 bg-[#fdf8f4]'
              : 'border-[#ecd2be] hover:border-[#df8758]/60 bg-[#fefaf7]/70 hover:bg-[#fefaf7]'
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
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#df8758]/25 to-[#ba4f1a]/30 flex items-center justify-center text-[#ba4f1a] shadow-xs">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#22130b] truncate max-w-[280px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#786154] font-medium">
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
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#b83b3b] hover:text-[#8a2222] font-medium px-2.5 py-1 rounded-md bg-[#b83b3b]/10 hover:bg-[#b83b3b]/20 transition-all cursor-pointer"
              >
                <X className="h-3 w-3" />
                Remove File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-[#df8758]/15 to-[#ba4f1a]/20 flex items-center justify-center text-[#ba4f1a] border border-[#df8758]/30 shadow-xs">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#22130b]">
                  Drag and drop your file here, or <span className="text-[#ba4f1a] underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-[#786154] mt-1">
                  Supported formats: <span className="font-semibold">.CSV</span>, <span className="font-semibold">.TSV</span>, <span className="font-semibold">.XLSX</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#b83b3b]/10 border border-[#b83b3b]/25 text-[#912323] text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Optional Custom Column Input */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-0.5">
            <label htmlFor="custom-column-input" className="text-xs font-semibold text-[#22130b] block">
              Review Column Override <span className="text-[11px] text-[#786154] font-normal">(Optional)</span>
            </label>
            <p className="text-[11px] text-[#786154]">
              Leave empty to automatically detect columns named <em>review</em>, <em>text</em>, <em>feedback</em>, or <em>comment</em>.
            </p>
          </div>
          <input
            id="custom-column-input"
            type="text"
            value={customColumn}
            onChange={(e) => setCustomColumn(e.target.value)}
            placeholder="e.g. customer_comments"
            className="w-full sm:w-56 px-3 py-1.5 text-xs rounded-lg border border-[#ecd2be] bg-white/90 text-[#22130b] focus:outline-hidden focus:ring-2 focus:ring-[#d96526]/40 focus:border-[#d96526] transition-all"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#d96526] via-[#c6551d] to-[#993b0a] hover:from-[#e37435] hover:to-[#a8440e] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(217,101,38,0.35)] transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing spreadsheet rows in real-time...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start Bulk Analysis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
