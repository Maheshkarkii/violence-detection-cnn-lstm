import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { UploadArea } from "../components/UploadArea"
import { SectionLabel } from "../components/SectionLabel"
import { useAuth } from "../lib/auth"
import { API_URL } from "../lib/config"
import { Shield, Video, TrendingUp, AlertTriangle, CheckCircle, Zap, History, Settings, LogOut, Share2, Download, Search, Globe } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Stats {
  total?: number
  violence_detected?: number
  non_violence?: number
  violence_percentage?: number
}

interface HistoryItem {
  id: number
  filename: string
  is_violence: boolean
  confidence: number
  timestamp: string
}

export function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [result, setResult] = useState<{ is_violence: boolean; confidence: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "violence" | "safe">("all")
  const [shareMessage, setShareMessage] = useState("")

  useEffect(() => {
    if (authLoading) return
    
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }
    fetchData()
    setIsPageLoading(false)
  }, [authLoading])

    const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/history`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (statsRes.status === 401 || historyRes.status === 401) {
        logout()
        navigate("/")
        return
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      if (historyRes.ok) {
        const data = await historyRes.json()
        setHistory(data.history || [])
      }
    } catch (e) {
      console.error("Failed to fetch data", e)
    }
  }

    const handleFileSelect = async (file: File) => {
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Please login first")
      navigate("/")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_URL}/detect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json()
        if (response.status === 401) {
          setError("Session expired. Please login again")
          logout()
          navigate("/")
          return
        }
        throw new Error(err.detail || "Detection failed")
      }

      const detectionResult = await response.json()
      setResult(detectionResult)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleExport = async (format: "csv" | "json") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `violence_detection_history.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      }
    } catch (e) {
      console.error("Export failed", e)
    }
  }

const handleShare = async (item: HistoryItem) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/share/${item.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        // Response contains share code (for future use)
        await response.json()
        const text = `Viol Detection Result\n\nFile: ${item.filename}\nResult: ${item.is_violence ? "Violence Detected" : "No Violence"}\nConfidence: ${item.confidence}%\n\nShared from ViolenceDetect AI`
        
        if (navigator.share) {
          await navigator.share({ text })
        } else {
          await navigator.clipboard.writeText(text)
          setShareMessage("Copied to clipboard!")
          setTimeout(() => setShareMessage(""), 3000)
        }
      }
    } catch (e) {
      console.error("Share failed", e)
    }
  }

  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || 
      (filterType === "violence" && item.is_violence) || 
      (filterType === "safe" && !item.is_violence)
    return matchesSearch && matchesFilter
  })

  const statCards = [
    { label: "Total Analyzed", value: stats?.total || 0, icon: Video, color: "gradient" },
    { label: "Violence Detected", value: stats?.violence_detected || 0, icon: AlertTriangle, color: "red" },
    { label: "Safe Content", value: stats?.non_violence || 0, icon: CheckCircle, color: "green" },
    { label: "Detection Rate", value: `${stats?.violence_percentage || 0}%`, icon: TrendingUp, color: "gradient" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl">ViolenceDetect</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-4">
              <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                <span className="text-sm font-medium text-white">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden md:inline"> Settings</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowLogoutConfirm(true)}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <SectionLabel pulse>Dashboard</SectionLabel>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">
              Welcome back, <span className="gradient-text">{user?.username}</span>
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Analyze videos for violent content using AI-powered detection
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              >
                <Card hover className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`mt-1 font-display text-3xl ${
                        stat.color === "gradient" ? "gradient-text" : 
                        stat.color === "red" ? "text-red-500" : "text-green-500"
                      }`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      stat.color === "gradient" ? "gradient-bg" : 
                      stat.color === "red" ? "bg-red-500/10" : "bg-green-500/10"
                    }`}>
                      <stat.icon className={`h-5 w-5 ${
                        stat.color === "gradient" ? "text-white" : 
                        stat.color === "red" ? "text-red-500" : "text-green-500"
                      }`} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 h-full">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl">Video Analysis</h2>
                    <p className="text-sm text-muted-foreground">Upload a video to detect violent content</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-500">
                    {error}
                  </div>
                )}

                <UploadArea
                  onFileSelect={handleFileSelect}
                  isLoading={isLoading}
                  result={result}
                />

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className={`mt-6 rounded-2xl border-2 p-6 text-center ${
                        result.is_violence
                          ? "border-red-500 bg-red-500/[0.08]"
                          : "border-green-500 bg-green-500/[0.08]"
                      }`}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
                          result.is_violence ? "bg-red-500/20" : "bg-green-500/20"
                        }`}
                      >
                        {result.is_violence ? (
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        )}
                      </motion.div>
                      <h3 className="font-display text-2xl">
                        {result.is_violence ? "Violence Detected" : "No Violence"}
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        Confidence: <span className="font-medium text-foreground">{result.confidence}%</span>
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button 
                          variant="secondary" 
                          onClick={() => setResult(null)}
                        >
                          Analyze Another Video
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="p-6 h-full">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
                      <History className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl">Analysis History</h2>
                      <p className="text-sm text-muted-foreground">{history.length} total results</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleExport("csv")} title="Export CSV">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search videos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-transparent text-sm focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background outline-none transition-all"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="all">All</option>
                    <option value="violence">Violence</option>
                    <option value="safe">Safe</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {filteredHistory.length === 0 ? (
                    <div className="py-8 text-center">
                      <Video className="mx-auto h-12 w-12 text-muted-foreground/30" />
                      <p className="mt-3 text-muted-foreground">No videos found</p>
                    </div>
                  ) : (
                    filteredHistory.slice(0, 8).map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className={`flex items-center gap-3 rounded-xl p-3 ${
                          item.is_violence 
                            ? "bg-red-500/[0.06] border border-red-500/20" 
                            : "bg-green-500/[0.06] border border-green-500/20"
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          item.is_violence ? "bg-red-500/20" : "bg-green-500/20"
                        }`}>
                          {item.is_violence ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{item.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-medium ${
                            item.is_violence ? "text-red-500" : "text-green-500"
                          }`}>
                            {item.confidence}%
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleShare(item)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {filteredHistory.length > 8 && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Showing 8 of {filteredHistory.length} results. Use search to filter.
                  </p>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md mx-4"
            >
              <Card className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <LogOut className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="font-display text-2xl">Confirm Logout</h3>
                <p className="mt-2 text-muted-foreground">
                  Are you sure you want to logout? You will need to login again to access the dashboard.
                </p>
                <div className="mt-8 flex gap-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setShowLogoutConfirm(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {shareMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50 rounded-xl bg-green-500 text-white px-4 py-2 shadow-lg"
        >
          {shareMessage}
        </motion.div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-accent" />
              <span className="font-display">ViolenceDetect</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com/Maheshkarkii/violence-detection-cnn-lstm" target="_blank" className="hover:text-foreground transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
            <p>© 2026 Violence Detection System</p>
          </div>
        </div>
      </footer>
    </div>
  )
}