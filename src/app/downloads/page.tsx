"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Sparkles, Download, Upload, FileText, Image, File, Github, Loader2, CheckCircle, AlertCircle, Trash2, Lock, Eye, EyeOff } from "lucide-react"
import { MobileMenu } from "@/components/ui/mobile-menu"

interface UploadedFile {
  url: string
  downloadUrl: string
  filename: string
  originalName: string
  size: number
  type: string
  uploadedAt: string
}

const AUTH_KEY = 'alan-batt-auth'

export default function DownloadsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY)
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth)
        const now = Date.now()
        if (now < authData.expires) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem(AUTH_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  // Load files from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles()
    }
  }, [isAuthenticated])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      if (response.ok) {
        const fetchedFiles = await response.json()
        setFiles(fetchedFiles)
      } else {
        console.error('Failed to fetch files')
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const handleLogin = async () => {
    setAuthError('')
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          authenticated: true,
          expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
        }))
        setPassword('')
      } else {
        setAuthError('Invalid access code. Please try again.')
      }
    } catch {
      setAuthError('Connection error. Please try again.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_KEY)
    setPassword('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Alan Batt Technology Hub</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button variant="ghost" asChild>
                <Link href="/">← Back to Home</Link>
              </Button>
            </div>
          </nav>
        </header>

        {/* Login Form */}
        <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="max-w-md w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Required</h1>
                <p className="text-slate-600">Enter the access code to use the file management system</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter access code"
                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {authError && (
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{authError}</span>
                  </div>
                )}

                <Button 
                  onClick={handleLogin}
                  disabled={!password.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Access File Manager
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  Contact Dan or Jamie at Magicalogical for access codes
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-slate-500">
          <p>&copy; 2025 Alan Batt Technology Hub. Secure access required.</p>
        </footer>
      </div>
    )
  }

  // Rest of existing component code for authenticated users...
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Refresh the file list from the API
      await fetchFiles()
      setUploadStatus({ type: 'success', message: `File "${file.name}" uploaded successfully!` })
      
      // Clear the input
      event.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to upload file. Please try again.' 
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (indexToDelete: number) => {
    const fileToDelete = files[indexToDelete]
    
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fileToDelete.filename)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fileToDelete.url }),
      })

      if (response.ok) {
        // Remove from local state
        setFiles(prev => prev.filter((_, index) => index !== indexToDelete))
        setUploadStatus({ type: 'success', message: 'File deleted successfully' })
      } else {
        throw new Error('Failed to delete file')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to delete file. Please try again.' 
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />
    {/* eslint-disable-next-line jsx-a11y/alt-text */}
    if (type.includes('image')) return <Image className="w-5 h-5 text-blue-600" />
    return <File className="w-5 h-5 text-slate-600" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header with logout */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Alan Batt Technology Hub</span>
          </div>
          <div className="flex items-center space-x-6">
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-6">
              <Button variant="ghost" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/ai">AI</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/content">Content</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/new-dev">New Dev</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/reports">Reports</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/seo">SEO</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/markets">Markets</Link>
              </Button>
              <Button variant="ghost" asChild className="bg-blue-50 text-blue-600">
                <Link href="/downloads">Downloads</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="https://github.com/zenifieduk/alan-batt" target="_blank">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
            </div>
            
            {/* Mobile Menu */}
            <MobileMenu currentPage="downloads" />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900">
              Downloads & File Management
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto">
              Upload, manage, and share files securely. Perfect for documents, PDFs, images, and other resources.
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-3 text-indigo-600" />
              Upload New File
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-slate-500" />
                    <p className="mb-2 text-sm text-slate-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, TXT, PNG, JPG, GIF (Max 10MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                  />
                </label>
              </div>

              {/* Upload Status */}
              {uploadStatus && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {uploadStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{uploadStatus.message}</span>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Uploading file...</span>
                </div>
              )}
            </div>
          </div>

          {/* Files List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Download className="w-6 h-6 mr-3 text-indigo-600" />
              Available Downloads
            </h2>

            {files.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No files uploaded yet</p>
                <p className="text-sm text-slate-400">Upload your first file using the form above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(file.type)}
                      <div>
                        <h3 className="font-medium text-slate-900">{file.originalName}</h3>
                        <p className="text-sm text-slate-500">
                          {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => window.open(file.downloadUrl, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFile(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Easy Upload</h3>
              <p className="text-slate-600 text-sm">
                Simple drag-and-drop or click to upload files with instant processing
              </p>
            </div>

            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure Storage</h3>
              <p className="text-slate-600 text-sm">
                Files stored securely with Vercel Blob storage and public CDN delivery
              </p>
            </div>

            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">File Management</h3>
              <p className="text-slate-600 text-sm">
                Organised file listing with metadata, previews, and download tracking
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-slate-500">
        <p>&copy; 2025 Alan Batt Technology Hub. Secure file management powered by Vercel.</p>
      </footer>
    </div>
  )
} 