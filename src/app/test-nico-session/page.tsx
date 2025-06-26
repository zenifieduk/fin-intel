"use client";

import React, { useState } from 'react';
import { useNicoSession } from '@/hooks/useNicoSession';

const NicoSessionTestPage = () => {
  const [testMessage, setTestMessage] = useState('');
  const [testPlayer, setTestPlayer] = useState('');
  
  const nicoSession = useNicoSession({
    userId: 'test-user',
    clubId: 'manchester_united',
    autoCreate: true,
    preferences: {
      responseStyle: 'detailed',
      analysisDepth: 'comprehensive',
      voiceEnabled: true
    }
  });

  const handleAddMessage = async () => {
    if (testMessage.trim()) {
      const success = await nicoSession.addMessage('user', testMessage, 'test_intent');
      if (success) {
        setTestMessage('');
        // Add a NICO response
        setTimeout(() => {
          nicoSession.addMessage('nico', `I understand you said: "${testMessage}"`, 'response');
        }, 1000);
      }
    }
  };

  const handleHighlightPlayer = async () => {
    if (testPlayer.trim()) {
      const success = await nicoSession.highlightPlayer(testPlayer);
      if (success) {
        setTestPlayer('');
      }
    }
  };

  const handleClearHighlight = async () => {
    await nicoSession.highlightPlayer(null);
  };

  const handleGetAnalytics = async () => {
    const analytics = await nicoSession.getAnalytics();
    console.log('NICO Analytics:', analytics);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          NICO Session Storage Test
        </h1>

        {/* Session Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Session Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-blue-300 text-sm">Connection</div>
              <div className={`text-lg font-bold ${nicoSession.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {nicoSession.isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-blue-300 text-sm">Session ID</div>
              <div className="text-lg font-bold text-white truncate">
                {nicoSession.sessionId || 'None'}
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-blue-300 text-sm">Loading</div>
              <div className={`text-lg font-bold ${nicoSession.isLoading ? 'text-yellow-400' : 'text-gray-400'}`}>
                {nicoSession.isLoading ? 'Loading...' : 'Ready'}
              </div>
            </div>
          </div>

          {nicoSession.error && (
            <div className="mt-4 bg-red-500/20 border border-red-400/40 rounded-lg p-3 text-red-200">
              Error: {nicoSession.error}
            </div>
          )}
        </div>

        {/* Session Details */}
        {nicoSession.session && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Session Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-blue-300 text-sm">Club ID</div>
                <div className="text-white">{nicoSession.session.clubId}</div>
              </div>
              <div>
                <div className="text-blue-300 text-sm">User ID</div>
                <div className="text-white">{nicoSession.session.userId}</div>
              </div>
              <div>
                <div className="text-blue-300 text-sm">Created At</div>
                <div className="text-white">{nicoSession.session.createdAt.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-blue-300 text-sm">Last Active</div>
                <div className="text-white">{nicoSession.session.lastActiveAt.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-blue-300 text-sm mb-2">Context</div>
              <div className="text-white space-y-1">
                <div>Scenario: {nicoSession.session.context.activeScenario}</div>
                <div>Highlighted Player: {nicoSession.session.context.highlightedPlayer || 'None'}</div>
                <div>Last Action: {nicoSession.session.context.lastAction || 'None'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            {/* Add Message */}
            <div>
              <label className="block text-blue-300 text-sm mb-2">Add Test Message</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a test message..."
                  className="flex-1 bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
                <button
                  onClick={handleAddMessage}
                  disabled={!testMessage.trim() || nicoSession.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Message
                </button>
              </div>
            </div>

            {/* Highlight Player */}
            <div>
              <label className="block text-blue-300 text-sm mb-2">Highlight Player</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testPlayer}
                  onChange={(e) => setTestPlayer(e.target.value)}
                  placeholder="Enter player name..."
                  className="flex-1 bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
                <button
                  onClick={handleHighlightPlayer}
                  disabled={!testPlayer.trim() || nicoSession.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Highlight
                </button>
                <button
                  onClick={handleClearHighlight}
                  disabled={nicoSession.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => nicoSession.setScenario('attack')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Set Attack Scenario
              </button>
              <button
                onClick={() => nicoSession.recordAction('test_action')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Record Test Action
              </button>
              <button
                onClick={handleGetAnalytics}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Get Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Conversation Messages</h2>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {nicoSession.getMessages().map((message, index) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.type === 'user' ? 'bg-blue-600/20 ml-8' :
                  message.type === 'nico' ? 'bg-green-600/20 mr-8' :
                  'bg-gray-600/20'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold ${
                    message.type === 'user' ? 'text-blue-300' :
                    message.type === 'nico' ? 'text-green-300' :
                    'text-gray-300'
                  }`}>
                    {message.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/50">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-white">{message.content}</div>
                {message.intent && (
                  <div className="text-xs text-white/60 mt-1">Intent: {message.intent}</div>
                )}
              </div>
            ))}
            
            {nicoSession.getMessages().length === 0 && (
              <div className="text-center text-white/50 py-8">
                No messages yet. Add a test message to start the conversation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NicoSessionTestPage;