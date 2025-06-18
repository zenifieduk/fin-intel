"use client";

import React from 'react';
import { Trophy, ArrowLeft, Cpu, Database, Zap, MessageCircle } from 'lucide-react';

const ArchitecturePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  System Architecture Overview
                </h1>
                <p className="text-blue-200">Voice-enabled financial intelligence platform architecture</p>
              </div>
            </div>
            <a 
              href="/voice" 
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Aaran</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex space-x-6 items-center">
            <a href="/frf" className="text-white/70 hover:text-white transition-colors">
              FRF Analysis
            </a>
            <a href="/frf2" className="text-white/70 hover:text-white transition-colors">
              FRF2 Interactive
            </a>
            <a href="/frf3" className="text-white/70 hover:text-white transition-colors">
              FRF3 3-Year Model
            </a>
            <a href="/frf4" className="text-white/70 hover:text-white transition-colors">
              FRF4 Progression
            </a>
            <a href="/frf5" className="text-white/70 hover:text-white transition-colors">
              FRF5 Ultimate
            </a>
            <a href="/frf6" className="text-white/70 hover:text-white transition-colors">
              FRF6 Intelligence
            </a>
            <a href="/voice" className="text-white/70 hover:text-white transition-colors">
              Aaran
            </a>
            <a href="/architecture" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              Architecture
            </a>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Voice-Enabled Financial Intelligence Platform
          </h2>
          <p className="text-xl text-blue-200 mb-6">
            Complete system architecture showing voice AI integration, data processing, and ML capabilities
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-cyan-400" />
            System Architecture Flow
          </h3>
          
          <div className="bg-white rounded-lg p-6 mb-6 overflow-auto">
            <svg width="1000" height="600" viewBox="0 0 1000 600" className="w-full h-auto">
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
                </marker>
                
                {/* Drop shadow filter */}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2"/>
                </filter>
              </defs>
              
              {/* Background groups with cleaner styling */}
              <rect x="60" y="460" width="480" height="120" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" opacity="0.8"/>
              <text x="300" y="480" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">Data Sources</text>
              
              <rect x="620" y="460" width="320" height="120" rx="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" opacity="0.8"/>
              <text x="780" y="480" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="600">ML Model Training</text>
              
              {/* Main flow components - cleaner boxes */}
              
              {/* Top row - main flow */}
              <rect x="60" y="60" width="140" height="60" rx="12" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" filter="url(#shadow)"/>
              <text x="130" y="85" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">User Voice Input</text>
              
              <rect x="280" y="60" width="140" height="60" rx="12" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" filter="url(#shadow)"/>
              <text x="350" y="80" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">ElevenLabs</text>
              <text x="350" y="95" textAnchor="middle" fill="white" fontSize="10">Voice Synthesis</text>
              
              <rect x="500" y="60" width="140" height="60" rx="12" fill="#10b981" stroke="#059669" strokeWidth="2" filter="url(#shadow)"/>
              <text x="570" y="80" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Next.js Frontend</text>
              <text x="570" y="95" textAnchor="middle" fill="white" fontSize="10">Dashboard</text>
              
              {/* Middle row - orchestration */}
              <rect x="360" y="200" width="160" height="60" rx="12" fill="#f59e0b" stroke="#d97706" strokeWidth="2" filter="url(#shadow)"/>
              <text x="440" y="220" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">n8n Orchestration</text>
              <text x="440" y="235" textAnchor="middle" fill="white" fontSize="10">Semantic Parsing</text>
              
              {/* Backend row */}
              <rect x="200" y="320" width="160" height="60" rx="12" fill="#ef4444" stroke="#dc2626" strokeWidth="2" filter="url(#shadow)"/>
              <text x="280" y="340" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Python FastAPI</text>
              <text x="280" y="355" textAnchor="middle" fill="white" fontSize="10">ML & Data Processing</text>
              
              <rect x="440" y="320" width="140" height="60" rx="12" fill="#a855f7" stroke="#9333ea" strokeWidth="2" filter="url(#shadow)"/>
              <text x="510" y="340" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Google Vertex AI</text>
              <text x="510" y="355" textAnchor="middle" fill="white" fontSize="10">ML Platform</text>
              
              {/* Databases - simplified layout */}
              <rect x="80" y="500" width="100" height="40" rx="8" fill="#6366f1" stroke="#4f46e5" strokeWidth="1"/>
              <text x="130" y="520" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">PostgreSQL</text>
              
              <rect x="200" y="500" width="100" height="40" rx="8" fill="#06b6d4" stroke="#0891b2" strokeWidth="1"/>
              <text x="250" y="520" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Vector DB</text>
              
              <rect x="320" y="500" width="100" height="40" rx="8" fill="#ec4899" stroke="#db2777" strokeWidth="1"/>
              <text x="370" y="520" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Time Series</text>
              
              <rect x="440" y="500" width="80" height="40" rx="8" fill="#f97316" stroke="#ea580c" strokeWidth="1"/>
              <text x="480" y="520" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Redis</text>
              
              {/* Data Sources */}
              <rect x="80" y="540" width="120" height="30" rx="6" fill="#64748b" stroke="#475569" strokeWidth="1"/>
              <text x="140" y="558" textAnchor="middle" fill="white" fontSize="9">Opta Data Dumps</text>
              
              <rect x="220" y="540" width="120" height="30" rx="6" fill="#64748b" stroke="#475569" strokeWidth="1"/>
              <text x="280" y="558" textAnchor="middle" fill="white" fontSize="9">Other Stats & Data</text>
              
              {/* ML Training components */}
              <rect x="650" y="540" width="80" height="30" rx="6" fill="#92400e" stroke="#78350f" strokeWidth="1"/>
              <text x="690" y="558" textAnchor="middle" fill="white" fontSize="9">Training Data</text>
              
              <rect x="750" y="540" width="80" height="30" rx="6" fill="#92400e" stroke="#78350f" strokeWidth="1"/>
              <text x="790" y="558" textAnchor="middle" fill="white" fontSize="9">Trained Models</text>
              
              {/* Clean, simplified arrows */}
              
              {/* Main flow arrows */}
              <path d="M 200 90 L 270 90" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              <text x="235" y="85" textAnchor="middle" fill="#6b7280" fontSize="9">1. Voice-to-Text</text>
              
              <path d="M 420 90 L 490 90" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              <text x="455" y="85" textAnchor="middle" fill="#6b7280" fontSize="9">2. Text Input</text>
              
              <path d="M 570 120 L 470 190" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              <text x="540" y="155" textAnchor="middle" fill="#6b7280" fontSize="9">3. Command</text>
              
              <path d="M 440 260 L 320 310" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              <text x="400" y="285" textAnchor="middle" fill="#6b7280" fontSize="9">4. ML Request</text>
              
              <path d="M 360 350 L 430 350" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              <text x="395" y="345" textAnchor="middle" fill="#6b7280" fontSize="9">6. ML Platform</text>
              
              {/* Return flow - simplified */}
              <path d="M 360 230 L 350 120" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              <text x="320" y="175" textAnchor="middle" fill="#6b7280" fontSize="9">9. Response</text>
              
              <path d="M 280 90 L 210 90" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              <text x="245" y="105" textAnchor="middle" fill="#6b7280" fontSize="9">10. Voice Output</text>
              
              {/* Database connections - single clean line */}
              <path d="M 280 380 L 280 490" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
              <text x="250" y="435" textAnchor="middle" fill="#6b7280" fontSize="9">5. Data Storage</text>
              
              {/* Data sources connection */}
              <path d="M 200 530 L 220 380" stroke="#6b7280" strokeWidth="1" fill="none" markerEnd="url(#arrowhead)"/>
              
              {/* ML training connection */}
              <path d="M 650 555 L 580 360" stroke="#92400e" strokeWidth="1" fill="none" markerEnd="url(#arrowhead)"/>
              <path d="M 730 555 L 790 555" stroke="#92400e" strokeWidth="1" fill="none" markerEnd="url(#arrowhead)"/>
            </svg>
          </div>
        </div>

        {/* Architecture Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Frontend Layer */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
              Frontend & Voice Interface
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-200 mb-2">Next.js Frontend Dashboard</h4>
                <p className="text-sm text-gray-300">
                  Interactive financial dashboard with real-time position analysis, 
                  charts, and AI-powered insights for EFL Championship clubs.
                </p>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-purple-200 mb-2">ElevenLabs Voice Synthesis</h4>
                <p className="text-sm text-gray-300">
                  Advanced voice AI handling speech-to-text conversion and 
                  natural language responses with &quot;Aaran&quot; voice assistant.
                </p>
              </div>
            </div>
          </div>

          {/* Backend Layer */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-green-400" />
              Backend & Data Processing
            </h3>
            <div className="space-y-4">
              <div className="bg-green-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-200 mb-2">Python FastAPI Backend</h4>
                <p className="text-sm text-gray-300">
                  High-performance API handling ML model inference, data processing, 
                  and financial calculations for real-time analysis.
                </p>
              </div>
              <div className="bg-orange-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-orange-200 mb-2">n8n Orchestration</h4>
                <p className="text-sm text-gray-300">
                  Workflow automation for semantic parsing, command routing, 
                  and orchestrating complex data processing pipelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Layer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-cyan-400" />
            Data Storage & Sources
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-cyan-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-cyan-200 mb-2">PostgreSQL</h4>
              <p className="text-sm text-gray-300">
                Primary structured data storage for financial metrics, 
                club data, and historical analysis.
              </p>
            </div>
            
            <div className="bg-indigo-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-200 mb-2">Vector DB</h4>
              <p className="text-sm text-gray-300">
                Semantic search capabilities for intelligent 
                data retrieval and AI-powered insights.
              </p>
            </div>
            
            <div className="bg-pink-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-pink-200 mb-2">Time Series DB</h4>
              <p className="text-sm text-gray-300">
                Performance metrics tracking and 
                historical trend analysis over time.
              </p>
            </div>
            
            <div className="bg-red-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-red-200 mb-2">Redis Cache</h4>
              <p className="text-sm text-gray-300">
                High-speed caching for real-time 
                dashboard performance and API responses.
              </p>
            </div>
          </div>
        </div>

        {/* ML & AI Layer */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-purple-400" />
            Machine Learning & AI Platform
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-purple-200">Google Vertex AI</h4>
              <p className="text-sm text-gray-300">
                Enterprise ML platform providing model training, deployment, and management 
                for financial prediction models and risk assessment algorithms.
              </p>
              <ul className="mt-3 text-xs text-gray-400 list-disc list-inside">
                <li>Model training and versioning</li>
                <li>Automated ML pipelines</li>
                <li>Scalable inference endpoints</li>
                <li>Model monitoring and performance tracking</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-pink-200">Vertex AI Agent Builder</h4>
              <p className="text-sm text-gray-300">
                Advanced agent creation platform for building intelligent AI assistants 
                with domain-specific knowledge of EFL financial regulations and analytics.
              </p>
              <ul className="mt-3 text-xs text-gray-400 list-disc list-inside">
                <li>Natural language understanding</li>
                <li>Custom knowledge base integration</li>
                <li>Multi-turn conversation handling</li>
                <li>Intent recognition and fulfillment</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Flow Description */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Complete Data Flow
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-yellow-200">Voice Input Processing</h4>
              <ol className="text-sm text-gray-300 space-y-2">
                <li><span className="font-medium text-blue-300">1.</span> User speaks to Aaran voice assistant</li>
                <li><span className="font-medium text-blue-300">2.</span> ElevenLabs converts speech to structured text</li>
                <li><span className="font-medium text-blue-300">3.</span> Next.js dashboard receives the command</li>
                <li><span className="font-medium text-blue-300">4.</span> n8n parses intent and routes to appropriate handler</li>
                <li><span className="font-medium text-blue-300">5.</span> FastAPI processes ML inference and data queries</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-green-200">Response Generation</h4>
              <ol className="text-sm text-gray-300 space-y-2">
                <li><span className="font-medium text-green-300">6.</span> Data retrieved from multiple storage systems</li>
                <li><span className="font-medium text-green-300">7.</span> Vertex AI provides ML model predictions</li>
                <li><span className="font-medium text-green-300">8.</span> n8n orchestrates dashboard updates</li>
                <li><span className="font-medium text-green-300">9.</span> Text response generated and sent to ElevenLabs</li>
                <li><span className="font-medium text-green-300">10.</span> Voice output delivered to user</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-200 text-sm">
          <p>
            <strong>Voice-Enabled Financial Intelligence Platform</strong> - Complete system architecture overview
          </p>
          <p className="mt-1">
            🎯 Integrating: Voice AI • ML Platform • Real-time Analytics • Multi-database Architecture • Intelligent Orchestration
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchitecturePage;