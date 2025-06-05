"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { MessageCircle, Send, User, Bot, Loader2, ArrowLeft } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: 'user' | 'agent'
  timestamp: Date
}

interface EllieTextChatProps {
  agentId: string
  onBack?: () => void
  title?: string
  description?: string
}

export function EllieTextChat({ 
  agentId, 
  onBack, 
  title = "Chat with Ellie", 
  description = "Text-based AI assistant" 
}: EllieTextChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    // Add welcome message only after component mounts (client-side)
    if (!isInitialized) {
      const welcomeMessage: Message = {
        id: 'welcome-message',
        content: "Hello! I'm Ellie, your AI assistant. I can help you with property inquiries, bookings, and general questions about Alan Batt's services. How can I assist you today?",
        sender: 'agent',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      setIsInitialized(true)
    }
  }, [isInitialized])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          agentId: agentId,
          conversationHistory: messages.slice(-10)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from agent')
      }

      const data = await response.json()

      const agentMessage: Message = {
        id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: data.response || "I apologise, but I couldn't process your request at the moment. Please try again.",
        sender: 'agent',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (err) {
      setError('Sorry, there was an error processing your message. Please try again.')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Show loading state until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return (
      <div className="flex flex-col h-full max-h-[600px] bg-white rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="flex items-center space-x-2 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Initializing chat...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-2xl shadow-lg border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex items-center space-x-3 flex-1 justify-center">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'user' 
                ? 'bg-blue-500' 
                : 'bg-gradient-to-r from-green-500 to-blue-500'
            }`}>
              {message.sender === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={`flex-1 max-w-[80%] ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}>
              <div className={`p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-600">Ellie is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-2">
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 inline-block">
              {error}
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Powered by ElevenLabs AI
        </p>
      </div>
    </div>
  )
} 