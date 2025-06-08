"use client"

import { useState, useCallback } from "react"
import { useConversation } from '@elevenlabs/react';
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Sparkles, Mic, PhoneOff, Loader2, ArrowLeft } from "lucide-react"
import { AaranTextChat } from "@/components/AaranTextChat"

export default function ElliePage() {
  const [showEllieInterface, setShowEllieInterface] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [hasRequestedMicPermission, setHasRequestedMicPermission] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to Ellie');
    },
    onDisconnect: () => {
      console.log('Disconnected from Ellie');
    },
    onMessage: (message) => {
      console.log('Message from Ellie:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
    },
  });

  const requestMicrophonePermission = useCallback(async () => {
    if (hasRequestedMicPermission) return micPermissionGranted;
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionGranted(true);
      setHasRequestedMicPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermissionGranted(false);
      setHasRequestedMicPermission(true);
      return false;
    }
  }, [hasRequestedMicPermission, micPermissionGranted]);

  const startConversationWithEllie = useCallback(async () => {
    try {
      // Request microphone permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return; // Stay in the card with permission denied message
      }

      await conversation.startSession({
        agentId: 'x7sgGIFhnuZ1Joe6r2tT', // Ellie Agent ID from alan-batt project
      });
    } catch (error) {
      console.error('Failed to start conversation with Ellie:', error);
    }
  }, [conversation, requestMicrophonePermission]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  }, [conversation]);

  const handleTalkToEllie = () => {
    setShowEllieInterface(true)
    console.log("Opening Ellie interface in card")
  }

  const handleBackToDemo = () => {
    setShowEllieInterface(false)
    // Optionally end conversation when going back
    if (conversation.status === 'connected') {
      endConversation()
    }
  }

  const handleChatWithEllieChatbot = () => {
    setShowChatInterface(true)
    console.log("Opening Ellie text chat interface")
  }

  const handleBackToAI = () => {
    setShowChatInterface(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Fin-Intel Voice Assistant</span>
          </div>
          <div className="flex items-center space-x-6">
            <Button variant="ghost" asChild>
              <Link href="/voice">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Conditional Content Rendering */}
      {showChatInterface ? (
        /* Text Chat Interface */
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <AaranTextChat
              agentId="agent_01jx2dwz4yeke9dzh7bwjacdxh"
              onBack={handleBackToAI}
              title="Chat with Aaran - Financial Assistant"
              description="AI Financial Assistant for FRF7 Dashboard"
            />
          </div>
        </main>
      ) : (
        /* Main AI Demo Content */
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="mb-16 text-left">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900">
                Ellie - Financial Intelligence Assistant
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-3xl">
                Meet Ellie, your advanced AI financial assistant powered by ElevenLabs technology. 
                She can help you understand complex financial data, provide insights on football club economics, 
                and guide you through the FRF7 dashboard with natural conversation.
              </p>
            </div>

            {/* Demo Cards */}
            <div className="space-y-16">
              {/* Ellie Voice Section */}
              <section className="space-y-8">
                {/* Ellie Introduction */}
                <div className="text-left max-w-4xl">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    1. Voice Conversation with Ellie
                  </h2>
                  <p className="text-lg text-slate-600">
                    Ellie is our advanced voice assistant powered by ElevenLabs AI technology. 
                    She can help you navigate financial data, explain league position impacts, 
                    and provide insights about football club economics through natural conversation.
                  </p>
                </div>

                {/* Ellie Demo Card - Centered */}
                <div className="flex justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300 w-full max-w-md">
                    <div className="flex flex-col items-center text-center">
                      
                      {!showEllieInterface ? (
                        // Initial Demo Card State
                        <>
                          {/* Icon */}
                          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                            <Phone className="w-8 h-8 text-blue-600" />
                          </div>

                          {/* Title */}
                          <h3 className="text-2xl font-bold text-slate-900 mb-4">
                            Talk to Ellie
                          </h3>

                          {/* Description */}
                          <p className="text-slate-600 mb-3">
                            Voice financial assistant powered by ElevenLabs AI
                          </p>

                          {/* Call to Action */}
                          <p className="text-slate-700 font-medium mb-8">
                            Click below to start a voice conversation with Ellie
                          </p>

                          {/* Button */}
                          <Button 
                            onClick={handleTalkToEllie}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 text-lg font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            size="lg"
                          >
                            <Mic className="w-5 h-5 mr-3" />
                            Start Voice Call with Ellie
                          </Button>
                          
                          {/* Agent ID Reference */}
                          <p className="text-xs text-slate-500 mt-4">
                            Agent ID: x7sgGIFhnuZ1Joe6r2tT
                          </p>
                        </>
                      ) : (
                        // Voice Interface State
                        <>
                          {/* Header with back button */}
                          <div className="flex items-center justify-between w-full mb-6">
                            <Button
                              onClick={handleBackToDemo}
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900"
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back to Demo
                            </Button>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <Phone className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-slate-900">Talk to Ellie</h3>
                                <p className="text-sm text-slate-600">AI Financial Assistant</p>
                              </div>
                            </div>
                          </div>

                          {/* Real-time Status Display */}
                          <div className="mb-6 min-h-[60px] flex items-center justify-center w-full">
                            {conversation.status === 'connected' && (
                              <div className="flex flex-col items-center space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                  <span className="font-medium text-green-600">🎤 Connected - Voice Chat Active</span>
                                </div>
                                
                                {conversation.isSpeaking ? (
                                  <div className="flex flex-col items-center space-y-1 text-purple-600">
                                    <div className="flex items-center space-x-2">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span className="font-medium">Ellie is speaking...</span>
                                    </div>
                                    <span className="text-xs text-slate-500">(talk to interrupt)</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2 text-blue-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="font-medium">Ellie is listening</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {conversation.status === 'connecting' && (
                              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Connecting to Ellie...</span>
                              </div>
                            )}

                            {!hasRequestedMicPermission && conversation.status === 'disconnected' && (
                              <div className="text-sm text-slate-600 text-center">
                                <p className="mb-2">Hi! I&apos;m Ellie, your AI financial assistant.</p>
                                <p>I&apos;ll need microphone access to chat with you!</p>
                              </div>
                            )}

                            {hasRequestedMicPermission && !micPermissionGranted && (
                              <div className="text-sm text-red-600 text-center">
                                <p className="mb-2">🎤 Microphone access needed</p>
                                <p className="text-xs text-slate-500">Please allow microphone access in your browser settings</p>
                              </div>
                            )}

                            {hasRequestedMicPermission && micPermissionGranted && conversation.status === 'disconnected' && (
                              <div className="text-sm text-blue-600 text-center">
                                <p>Ready to connect with Ellie</p>
                              </div>
                            )}
                          </div>

                          {/* Microphone Permission Request */}
                          {!hasRequestedMicPermission && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg w-full">
                              <p className="text-sm text-blue-800 mb-3">
                                Ellie needs microphone access to have a conversation with you.
                              </p>
                              <Button
                                onClick={requestMicrophonePermission}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Allow Microphone
                              </Button>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="space-y-3 w-full">
                            {conversation.status === 'disconnected' ? (
                              <Button
                                onClick={startConversationWithEllie}
                                disabled={!micPermissionGranted && hasRequestedMicPermission}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-400 text-white py-3"
                              >
                                <Mic className="w-4 h-4 mr-2" />
                                {!hasRequestedMicPermission ? 'Start Voice Conversation' : 
                                 !micPermissionGranted ? 'Microphone Required' : 'Start Voice Call'}
                              </Button>
                            ) : (
                              <Button
                                onClick={endConversation}
                                variant="destructive"
                                className="w-full py-3"
                              >
                                <PhoneOff className="w-4 h-4 mr-2" />
                                End Conversation
                              </Button>
                            )}

                            {/* Fallback to External Link */}
                            <Button
                              onClick={() => window.open('https://elevenlabs.io/convai/conversation/x7sgGIFhnuZ1Joe6r2tT', '_blank')}
                              variant="outline"
                              className="w-full py-3"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Open in New Tab
                            </Button>
                          </div>

                          {/* Usage Note */}
                          <p className="text-xs text-slate-500 mt-4 text-center">
                            Ask Ellie about league positions, financial implications, or dashboard navigation
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
              {/* Ellie Text Chat Section */}
              <section className="space-y-8">
                {/* Ellie Text Chat Introduction */}
                <div className="text-left max-w-4xl">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    2. Text Chat with Ellie
                  </h2>
                  <p className="text-lg text-slate-600">
                    Prefer typing? Chat with Ellie through our text interface. 
                    She provides the same intelligent financial assistance through written conversation, 
                    perfect for detailed discussions about complex financial data.
                  </p>
                </div>

                {/* Ellie Text Chat Demo Card - Centered */}
                <div className="flex justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300 w-full max-w-md">
                    <div className="flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                        <MessageCircle className="w-8 h-8 text-green-600" />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        Chat with Ellie
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 mb-3">
                        Advanced text-based financial assistant
                      </p>

                      {/* Status Indicator */}
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-green-700">Status: Ready</span>
                      </div>

                      {/* Additional Info */}
                      <p className="text-slate-700 font-medium mb-8">
                        Experience intelligent conversation about financial data
                      </p>

                      {/* Button */}
                      <Button 
                        onClick={handleChatWithEllieChatbot}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 px-8 text-lg font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        size="lg"
                      >
                        <MessageCircle className="w-5 h-5 mr-3" />
                        Start Text Chat with Ellie
                      </Button>
                      
                      {/* Technology Note */}
                      <p className="text-xs text-slate-500 mt-4">
                        Same AI knowledge base as voice Ellie
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tech Stack & Capabilities */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Tech Stack */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                    Tech Stack
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                      ElevenLabs + ChatGPT 4.1
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      React + Next.js integration
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      Real-time voice processing
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                      Financial data analysis
                    </li>
                  </ul>
                </div>

                {/* Current Capabilities */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                    Current Capabilities
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      Financial data interpretation
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      League position analysis
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      Dashboard navigation help
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      Natural conversation flow
                    </li>
                  </ul>
                </div>

                {/* Planned Capabilities */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    Planned Capabilities
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      Predictive analytics
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      Custom report generation
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3" />
                      Integration with live data
                    </li>
                  </ul>
                </div>
              </div>

            {/* Live Demo Note */}
            <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-slate-700">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-medium">
                  Live Demo: Both voice and text interfaces use ElevenLabs AI technology. 
                  Experience natural conversation about football club financial intelligence!
                </span>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Natural Voice</h3>
                <p className="text-slate-600">
                  Powered by ElevenLabs for natural, human-like conversation
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Intelligent Chat</h3>
                <p className="text-slate-600">
                  Context-aware responses tailored to financial data analysis
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Financial Expert</h3>
                <p className="text-slate-600">
                  Specialized in football club economics and league position analysis
                </p>
              </div>
            </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-slate-500">
        <p>&copy; 2024 Fin-Intel. Experience the future of AI-powered financial conversation.</p>
      </footer>
    </div>
  )
}