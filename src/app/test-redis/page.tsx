'use client'

import { useState, useEffect } from 'react'
import { MigrationHelper } from '@/utils/migration-helper'

export default function TestRedisPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed' | 'credentials-missing'>('testing')
  const [memoryType, setMemoryType] = useState<string>('')
  const [testData, setTestData] = useState<any>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setConnectionStatus('testing')
    
    // Check memory type
    const type = MigrationHelper.getMemoryType()
    setMemoryType(type)
    
    if (type === 'localStorage') {
      setConnectionStatus('credentials-missing')
      return
    }
    
    if (type === 'ssr') {
      setConnectionStatus('failed')
      return
    }

    // Test Redis connection
    const isConnected = await MigrationHelper.testRedisConnection()
    setConnectionStatus(isConnected ? 'connected' : 'failed')
    
    if (isConnected) {
      // Test data operations
      try {
        const memory = await MigrationHelper.getConversationMemory('test-user')
        await memory.learnFromInteraction({
          userInput: 'Test Redis connection',
          intent: 'test',
          aaranResponse: 'Redis connection successful!',
          actionTaken: 'test_action'
        })
        
        // Check which type of memory we're using and get appropriate data
        if ('getUserProfile' in memory) {
          // Redis memory
          const profile = await (memory as any).getUserProfile()
          setTestData(profile)
        } else {
          // localStorage memory  
          const preferences = (memory as any).getUserPreferences()
          setTestData({ type: 'localStorage', preferences })
        }
      } catch (error) {
        console.error('Data operation failed:', error)
      }
    }
  }

  const StatusIndicator = () => {
    switch (connectionStatus) {
      case 'testing':
        return <div className="text-yellow-400">🔄 Testing connection...</div>
      case 'connected':
        return <div className="text-green-400">✅ Redis connected successfully!</div>
      case 'failed':
        return <div className="text-red-400">❌ Redis connection failed</div>
      case 'credentials-missing':
        return <div className="text-orange-400">⚠️ Redis credentials not found - using localStorage</div>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Redis Migration Test</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <StatusIndicator />
          <div className="mt-4">
            <strong>Memory Type:</strong> {memoryType}
          </div>
        </div>

        {connectionStatus === 'credentials-missing' && (
          <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-400/20 mb-6">
            <h3 className="text-lg font-semibold mb-2">⚙️ Setup Required</h3>
            <p className="mb-4">Add these environment variables to your <code>.env.local</code>:</p>
            <pre className="bg-black/30 p-4 rounded text-sm">
{`NEXT_PUBLIC_UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN=your-token-here`}
            </pre>
            <p className="mt-4 text-sm text-orange-200">
              See <code>REDIS_SETUP.md</code> for detailed setup instructions.
            </p>
          </div>
        )}

        {connectionStatus === 'connected' && testData && (
          <div className="bg-green-900/30 rounded-xl p-6 border border-green-400/20">
            <h3 className="text-lg font-semibold mb-2">✅ Test Data</h3>
            <pre className="bg-black/30 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <button 
            onClick={testConnection}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retry Connection Test
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-300">
          <p><strong>Next Steps:</strong></p>
          <ol className="list-decimal ml-6 mt-2 space-y-1">
            <li>Create Upstash Redis account</li>
            <li>Add credentials to .env.local</li>
            <li>Restart dev server</li>
            <li>Test will automatically migrate localStorage data</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 