import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ImageIcon, X, CheckCircle2, Scan } from 'lucide-react'
import clsx from 'clsx'

interface UploadPanelProps {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

export default function UploadPanel({ onFileSelected, disabled }: UploadPanelProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setFileName(file.name)
      const url = URL.createObjectURL(file)
      setPreview(url)
      onFileSelected(file)
    },
    [onFileSelected],
  )

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/bmp': [], 'image/tiff': [] },
    maxFiles: 1,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  })

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setFileName(null)
  }

  return (
    <div className="space-y-4">
      <p className="section-heading">MRI Image Upload</p>

      <div
        {...getRootProps()}
        className={clsx(
          'relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden',
          isDragActive && !isDragReject  && 'border-blue-400 bg-blue-500/10 scale-[1.01]',
          isDragReject                   && 'border-red-400 bg-red-500/10',
          !isDragActive && !isDragReject && !preview && 'border-white/15 hover:border-blue-400/50 hover:bg-white/[0.02]',
          preview                        && 'border-green-400/40 bg-green-500/5',
          disabled                       && 'opacity-50 cursor-not-allowed',
        )}
        style={{ minHeight: '260px' }}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {preview ? (
            /* ── Preview state ─────────────────────────────────────────────── */
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center p-6 gap-4"
            >
              <div className="relative">
                <img
                  src={preview}
                  alt="MRI preview"
                  className="h-40 w-40 rounded-xl object-cover ring-2 ring-green-400/30"
                />
                {/* Scan line overlay */}
                <div className="absolute inset-0 rounded-xl overflow-hidden scan-line" />
                {!disabled && (
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 size={16} />
                <span className="text-sm font-medium truncate max-w-[200px]">{fileName}</span>
              </div>
              {!disabled && (
                <p className="text-xs text-slate-500">Click or drag to replace image</p>
              )}
            </motion.div>
          ) : (
            /* ── Empty state ────────────────────────────────────────────────── */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-5 p-10 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className={clsx(
                  'w-20 h-20 rounded-2xl flex items-center justify-center',
                  isDragReject ? 'bg-red-500/20' : 'bg-blue-500/10',
                )}
              >
                {isDragActive && !isDragReject ? (
                  <Scan size={36} className="text-blue-400" />
                ) : isDragReject ? (
                  <X size={36} className="text-red-400" />
                ) : (
                  <Upload size={36} className="text-blue-400" />
                )}
              </motion.div>

              <div>
                <p className="text-lg font-semibold text-white mb-1">
                  {isDragActive && !isDragReject ? 'Drop to analyze' :
                   isDragReject ? 'Invalid file type' :
                   'Drop your MRI scan here'}
                </p>
                <p className="text-sm text-slate-400">
                  or{' '}
                  <span className="text-blue-400 font-medium underline underline-offset-2">
                    browse files
                  </span>
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  Supports JPG, PNG, BMP, TIFF · Max 20 MB
                </p>
              </div>

              {/* Format badges */}
              <div className="flex gap-2">
                {['JPG', 'PNG', 'BMP', 'TIFF'].map(fmt => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-400"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated corner accents */}
        {isDragActive && !isDragReject && (
          <>
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400 rounded-tl" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400 rounded-br" />
          </>
        )}
      </div>

      {/* Format info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ImageIcon size={12} />
        <span>For best results, use axial T1 or T2-weighted MRI scans at standard resolution</span>
      </div>
    </div>
  )
}
