import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./components/Button"
import { Card } from "./components/Card"
import { SectionLabel } from "./components/SectionLabel"
import { AuthModal } from "./components/AuthModal"
import { checkHealth } from "./lib/api"
import { useAuth } from "./lib/auth"
import { Shield, Zap, Globe, ArrowRight, FileVideo, Brain, Clock, CheckCircle, Cpu, Layers, BarChart3, Sparkles, Menu, X } from "lucide-react"

function App() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showMenu, setShowMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    checkHealth().catch(() => {})
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  const features = [
    { icon: Brain, title: "Deep Learning AI", desc: "Advanced CNN-LSTM neural networks trained on real-world violence datasets for accurate detection.", color: "from-violet-500 to-purple-600" },
    { icon: Zap, title: "Real-Time Analysis", desc: "Process videos in under 2 seconds with optimized TensorFlow inference and frame sampling.", color: "from-amber-500 to-orange-600" },
    { icon: Shield, title: "Enterprise Security", desc: "JWT authentication, encrypted connections, and secure data handling to protect your privacy.", color: "from-emerald-500 to-teal-600" },
    { icon: FileVideo, title: "Multi-Format Support", desc: "Supports MP4, AVI, MOV, and WebM formats up to 100MB with automatic validation.", color: "from-blue-500 to-cyan-600" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Comprehensive statistics, history tracking, and exportable CSV reports for better insights.", color: "from-rose-500 to-pink-600" },
    { icon: Layers, title: "Batch Processing", desc: "Upload multiple videos in queue and analyze them sequentially without manual intervention.", color: "from-indigo-500 to-blue-600" },
  ]

  const stats = [
    { value: "97%", label: "Accuracy", icon: CheckCircle },
    { value: "<2s", label: "Processing", icon: Clock },
    { value: "10", label: "Frames/Video", icon: Layers },
    { value: "99.9%", label: "Uptime", icon: Cpu },
  ]

  const howItWorks = [
    { step: "01", title: "Upload Video", desc: "Drag & drop or browse to upload your video file securely." },
    { step: "02", title: "AI Analysis", desc: "Our CNN-LSTM model analyzes frames and temporal patterns." },
    { step: "03", title: "Get Results", desc: "Receive instant violence detection results with confidence score." },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-background to-background" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/20 blur-[150px]"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-accent-secondary/20 blur-[120px]"
        />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-lg blur-md opacity-50 animate-pulse" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="font-display text-xl tracking-tight">ViolenceDetect</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stats</a>
            {user ? (
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                  Profile
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>
                  Login
                </Button>
                <Button size="sm" onClick={() => openAuth("register")}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block py-2 text-sm" onClick={() => setShowMenu(false)}>Features</a>
                <a href="#how-it-works" className="block py-2 text-sm" onClick={() => setShowMenu(false)}>How it Works</a>
                <a href="#stats" className="block py-2 text-sm" onClick={() => setShowMenu(false)}>Stats</a>
                <div className="pt-4 space-y-3">
                  <Button variant="ghost" className="w-full" onClick={() => { setShowMenu(false); openAuth("login"); }}>
                    Login
                  </Button>
                  <Button className="w-full" onClick={() => { setShowMenu(false); openAuth("register"); }}>
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Violence Detection</span>
              </div>
            </motion.div>

            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Detect Violence in{" "}
              <span className="gradient-text">Videos</span>{" "}
              <br className="hidden sm:block" />
              with AI Precision
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Advanced CNN-LSTM deep learning model analyzes video sequences to identify violent content with <span className="font-bold text-accent">97% accuracy</span>. Fast, reliable, and automated detection.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {user ? (
                <Button size="lg" onClick={() => navigate("/dashboard")} className="min-w-[200px]">
                  Analyze Videos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => openAuth("register")} className="min-w-[200px]">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => openAuth("login")}>
                    Sign In
                  </Button>
                </>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Free to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>97% Accurate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Private & Secure</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl">Powerful AI Detection Features</h2>
            <p className="mt-4 mx-auto max-w-2xl text-muted-foreground text-lg">
              Everything you need to analyze videos for violent content with enterprise-grade accuracy and security.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card hover className="h-full p-6 group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-3xl`} />
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionLabel>How it Works</SectionLabel>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl">Three Simple Steps</h2>
            <p className="mt-4 mx-auto max-w-2xl text-muted-foreground text-lg">
              Get started with video violence detection in minutes.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-8xl font-display text-accent/10 absolute -top-4 left-0">{item.step}</div>
                <div className="relative pt-12">
                  <h3 className="font-display text-2xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-accent/20 h-8 w-8" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent to-accent-secondary opacity-95" />
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5zIiBkPSJNMzAgMEwzMCAzMEwzMCAwWk0zMCAzMEwzMCA2MEwzMCAzMFpNMCAzMEw2MCAzMEwwIDMwWk0wIDMwTDYwIDYwTDAgNjBaIi8+PC9zdmc+')] opacity-10"
        />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl text-white">Trusted by Thousands</h2>
            <p className="mt-4 mx-auto max-w-2xl text-white/70 text-lg">
              Industry-leading performance and reliability you can count on.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="font-display text-4xl sm:text-5xl text-white">{stat.value}</div>
                <div className="mt-2 text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
            <p className="mt-4 mx-auto max-w-2xl text-muted-foreground text-lg">
              Start analyzing videos for violent content today. No credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => openAuth("register")}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="ghost" size="lg" onClick={() => openAuth("login")}>
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-display text-xl">ViolenceDetect</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                AI-powered violence detection system using advanced CNN-LSTM deep learning models. Fast, accurate, and secure.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a></li>
                <li><a href="#stats" className="hover:text-foreground transition-colors">Stats</a></li>
                <li><a href="https://github.com/Maheshkarkii/violence-detection-cnn-lstm" target="_blank" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="https://github.com/Maheshkarkii/violence-detection-cnn-lstm" target="_blank" className="p-2 rounded-lg bg-muted hover:bg-accent/10 hover:text-accent transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 Violence Detection System. All rights reserved.</p>
            <p>Built by Mahesh Karki, Anil Paneru, and Rahul Mishra</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} mode={authMode} />
    </div>
  )
}

export default App