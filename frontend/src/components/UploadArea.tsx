import { useState, useRef, useEffect } from "react"
import { cn } from "../lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileVideo, X, Shield, ShieldAlert, Play, Pause, Layers } from "lucide-react"
import { Button } from "./Button"

interface UploadAreaProps {
  onFileSelect: (file: File) => void
  onFilesSelect?: (files: File[]) => void
  isLoading: boolean
  result?: {
    is_violence: boolean
    confidence: number
  } | null
  multiUpload?: boolean
}

export function UploadArea({ onFileSelect, onFilesSelect, isLoading, result, multiUpload = false }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("video/"))
    if (files.length === 0) return

    if (multiUpload && files.length > 1) {
      setQueue(prev => [...prev, ...files])
      setSelectedFiles(prev => [...prev, ...files])
      if (onFilesSelect) onFilesSelect([...selectedFiles, ...files])
    } else if (files[0]) {
      setSelectedFile(files[0])
      createPreview(files[0])
      onFileSelect(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return

    if (multiUpload && files.length > 1) {
      setQueue(prev => [...prev, ...files])
      setSelectedFiles(prev => [...prev, ...files])
    } else if (files[0]) {
      setSelectedFile(files[0])
      createPreview(files[0])
      onFileSelect(files[0])
    }
  }

  const createPreview = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSelectFromQueue = (file: File) => {
    setSelectedFile(file)
    createPreview(file)
    onFileSelect(file)
  }

  const removeFromQueue = (index: number) => {
    const file = queue[index]
    setQueue(prev => prev.filter((_, i) => i !== index))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    if (selectedFile === file) {
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const analyzeNext = () => {
    if (queue.length > 0) {
      const nextFile = queue[0]
      handleSelectFromQueue(nextFile)
      setQueue(prev => prev.slice(1))
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "rounded-2xl border-2 p-8 text-center",
              result.is_violence
                ? "border-red-500 bg-red-500/10"
                : "border-green-500 bg-green-500/10"
            )}
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              {result.is_violence ? (
                <ShieldAlert className="h-12 w-12 text-red-500" />
              ) : (
                <Shield className="h-12 w-12 text-green-500" />
              )}
            </div>
            <h3 className="mb-2 font-display text-2xl">{result.is_violence ? "Violence Detected" : "No Violence"}</h3>
            <p className="text-muted-foreground">Confidence: {result.confidence}%</p>
            <button
              onClick={() => {
                setSelectedFile(null)
                if (previewUrl) URL.revokeObjectURL(previewUrl)
                setPreviewUrl(null)
              }}
              className="mt-4 text-sm text-accent hover:underline"
            >
              Analyze another video
            </button>
          </motion.div>
        ) : selectedFile && previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full h-full object-contain"
                onEnded={() => setIsPlaying(false)}
              />
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-foreground" />
                  ) : (
                    <Play className="h-8 w-8 text-foreground ml-1" />
                  )}
                </div>
              </button>
              <button
                onClick={removeFile}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <FileVideo className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB | {selectedFile.type.split('/')[1]?.toUpperCase()}
                  </p>
                </div>
              </div>
              {isLoading && (
                <div className="mt-4">
                  <div className="h-2 animate-pulse rounded-full bg-accent/20">
                    <motion.div
                      className="h-full rounded-full gradient-bg"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground text-center">Analyzing video...</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : queue.length > 0 ? (
          <motion.div
            key="queue"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-accent" />
              <h3 className="font-display text-lg">Upload Queue</h3>
              <span className="ml-auto rounded-full bg-accent/10 px-3 py-1 text-sm">{queue.length} videos</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {queue.map((file, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-muted p-2">
                  <FileVideo className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                  <button onClick={() => removeFromQueue(i)} className="text-muted-foreground hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {selectedFile && (
              <Button 
                variant="secondary" 
                className="w-full mt-4"
                onClick={analyzeNext}
                disabled={queue.length === 0}
              >
                Analyze Next ({queue.length} remaining)
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200",
              dragActive
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/50"
            )}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              multiple={multiUpload}
              className="hidden"
              onChange={handleChange}
            />
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Upload className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 font-display text-xl">
              {multiUpload ? "Upload Videos" : "Upload Video"}
            </h3>
            <p className="text-muted-foreground">
              Drag and drop or click to browse
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Supported: MP4, AVI, MOV, WebM | Max 100MB
            </p>
            {multiUpload && (
              <p className="mt-2 text-xs text-accent">
                Hold Ctrl/Cmd to select multiple files
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}