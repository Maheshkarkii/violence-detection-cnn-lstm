import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { useAuth } from "../lib/auth"
import { Shield, User, Mail, Save, LogOut, Eye, EyeOff, CheckCircle, Key, ArrowLeft, UserCog, Globe } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../lib/config"

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState(user?.username || "")
  const [email] = useState(user?.email || "")
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false })

  const handleSave = async () => {
    setMessage("")
    setError("")
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, full_name: fullName })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setMessage("Profile updated successfully!")
        localStorage.setItem("user", JSON.stringify({ username: updatedUser.username, email, full_name: fullName }))
      } else {
        const err = await response.json()
        setError(err.detail || "Failed to update profile")
      }
    } catch (e) {
      setError("An error occurred")
    }
  }

  const handleChangePassword = async () => {
    setMessage("")
    setError("")
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/change-password`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      })

      if (response.ok) {
        setMessage("Password changed successfully!")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setActiveTab("profile")
      } else {
        const err = await response.json()
        setError(err.detail || "Failed to change password")
      }
    } catch (e) {
      setError("An error occurred")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (!user) {
    navigate("/")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-background to-background" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/15 blur-[120px]"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg">ViolenceDetect</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-2xl px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl sm:text-4xl">Profile Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your account settings and preferences</p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-xl w-fit"
          >
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "profile" 
                  ? "gradient-bg text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCog className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "password" 
                  ? "gradient-bg text-white" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Key className="h-4 w-4" />
              Password
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8">
                  {/* User Avatar Section */}
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/50">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent rounded-full blur-md opacity-30" />
                      <div className="relative w-20 h-20 rounded-full gradient-bg flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {user?.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-display text-2xl">{user?.username}</h2>
                      <p className="text-muted-foreground">{user?.email || "No email set"}</p>
                    </div>
                  </div>

                  {/* Alert Messages */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500 flex items-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={user?.username || ""}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-transparent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background outline-none transition-all"
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-muted cursor-not-allowed"
                          disabled
                          placeholder="your@email.com"
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-transparent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background outline-none transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-8" onClick={handleSave}>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </Button>
                </Card>
              </motion.div>
            )}

            {activeTab === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Key className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl">Change Password</h2>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500 flex items-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.old ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full h-12 px-4 pr-12 rounded-xl border border-border bg-transparent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background outline-none transition-all"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, old: !p.old }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.old ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-12 px-4 pr-12 rounded-xl border border-border bg-transparent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background outline-none transition-all"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-12 px-4 pr-12 rounded-xl border border-border bg-transparent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background outline-none transition-all"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleChangePassword}>
                      <Key className="h-5 w-5 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mt-6 p-6 border border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <LogOut className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">Logout from your account</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                You'll need to sign in again to access video analysis features.
              </p>
              <Button 
                variant="outline" 
                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
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
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <LogOut className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="font-display text-2xl">Sign Out</h3>
                <p className="mt-2 text-muted-foreground">
                  Are you sure you want to sign out? You'll need to sign in again to continue using the app.
                </p>
                <div className="mt-6 flex gap-4">
                  <Button 
                    variant="secondary" 
                    className="flex-1" 
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-red-500 hover:bg-red-600" 
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-8">
        <div className="mx-auto max-w-2xl px-6">
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