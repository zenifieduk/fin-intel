'use client'

import { useState } from 'react'

interface TestResult {
  query: string
  userRole: string
  elevenLabsRAG: {
    status: string
    latency: number
    results: number
    error?: string
  }
  sensitivityDetection: {
    requiresSecureData: boolean
    level: string
    keywords: string[]
  }
  recommendations: string[]
}

export default function TestHybridPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult | null>(null)
  const [customQuery, setCustomQuery] = useState('')
  const [userRole, setUserRole] = useState('general')

  const predefinedTests = [
    { query: "Tell me about Manchester United's history", role: 'general' },
    { query: "What are the salary details in the contract?", role: 'boardroom' },
    { query: "Who were the top scorers last season?", role: 'general' },
    { query: "Show me transfer fee negotiations", role: 'finance' },
    { query: "What is the club's founding date?", role: 'general' }
  ]

  const testQuery = async (query: string, role: string) => {
    setTesting(true)
    setResults(null)

    try {
      const response = await fetch(`/api/test-hybrid-knowledge?query=${encodeURIComponent(query)}&userRole=${role}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data)
      } else {
        console.error('Test failed:', data.error)
      }
    } catch (error) {
      console.error('Test error:', error)
    } finally {
      setTesting(false)
    }
  }

  const batchTest = async () => {
    setTesting(true)
    
    try {
      const queries = predefinedTests.map(test => test.query)
      const response = await fetch('/api/test-hybrid-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries })
      })
      
      const data = await response.json()
      console.log('Batch test results:', data)
      
      if (data.success) {
        // Show summary of batch results
        alert(`Batch test completed!\n\nTotal queries: ${data.summary.totalQueries}\nElevenLabs working: ${data.summary.elevenLabsWorking}\nSensitive queries: ${data.summary.sensitiveQueries}\nAverage latency: ${Math.round(data.summary.averageLatency)}ms`)
      }
    } catch (error) {
      console.error('Batch test error:', error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Hybrid Knowledge System Test
          </h1>
          <p className="text-white/70 mb-8">
            Test NICO's hybrid data routing: ElevenLabs RAG (ultra-fast) + Upstash Vector (secure)
          </p>

          {/* Custom Query Test */}
          <div className="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Custom Query Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Query:</label>
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Enter your test query..."
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">User Role:</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="general">General</option>
                  <option value="boardroom">Boardroom</option>
                  <option value="finance">Finance</option>
                  <option value="legal">Legal</option>
                  <option value="management">Management</option>
                </select>
              </div>
              <button
                onClick={() => testQuery(customQuery, userRole)}
                disabled={testing || !customQuery.trim()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium"
              >
                {testing ? 'Testing...' : 'Test Query'}
              </button>
            </div>
          </div>

          {/* Predefined Tests */}
          <div className="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Predefined Tests</h2>
            <div className="grid gap-3">
              {predefinedTests.map((test, index) => (
                <button
                  key={index}
                  onClick={() => testQuery(test.query, test.role)}
                  disabled={testing}
                  className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 rounded-lg text-left text-white/90"
                >
                  <div className="font-medium">{test.query}</div>
                  <div className="text-sm text-white/60">Role: {test.role}</div>
                </button>
              ))}
            </div>
            <button
              onClick={batchTest}
              disabled={testing}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              {testing ? 'Running Batch Test...' : 'Run All Tests'}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white/90">Query: "{results.query}"</h3>
                  <p className="text-white/70">User Role: {results.userRole}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* ElevenLabs RAG Results */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-white mb-2">🚀 ElevenLabs RAG</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Status:</span>
                        <span className={results.elevenLabsRAG.status === 'working' ? 'text-green-400' : 'text-red-400'}>
                          {results.elevenLabsRAG.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Latency:</span>
                        <span className="text-white">{results.elevenLabsRAG.latency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Results:</span>
                        <span className="text-white">{results.elevenLabsRAG.results}</span>
                      </div>
                      {results.elevenLabsRAG.error && (
                        <div className="text-red-400 text-xs mt-2">
                          Error: {results.elevenLabsRAG.error}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sensitivity Detection */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-white mb-2">🔒 Sensitivity Detection</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Secure Data Required:</span>
                        <span className={results.sensitivityDetection.requiresSecureData ? 'text-yellow-400' : 'text-green-400'}>
                          {results.sensitivityDetection.requiresSecureData ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Sensitivity Level:</span>
                        <span className="text-white">{results.sensitivityDetection.level}</span>
                      </div>
                      {results.sensitivityDetection.keywords.length > 0 && (
                        <div>
                          <span className="text-white/70">Keywords:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {results.sensitivityDetection.keywords.map((keyword, i) => (
                              <span key={i} className="px-2 py-1 bg-yellow-600/30 text-yellow-300 text-xs rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium text-white mb-2">💡 Recommendations</h4>
                  <ul className="space-y-1 text-sm text-white/80">
                    {results.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-medium text-white mb-2">🏗️ System Architecture</h3>
            <div className="text-sm text-white/70 space-y-1">
              <p>• <strong>ElevenLabs RAG:</strong> Ultra-low latency (~50ms) for non-sensitive data</p>
              <p>• <strong>Upstash Vector:</strong> Secure storage (~200ms) for contracts & financial data</p>
              <p>• <strong>Smart Routing:</strong> Automatic detection of sensitive keywords</p>
              <p>• <strong>Role-based Access:</strong> Boardroom/Finance/Legal roles get enhanced access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 