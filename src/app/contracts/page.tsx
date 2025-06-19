"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { 
  TrendingUp, PoundSterling, Users, Clock, Shield, 
  AlertTriangle, Calendar, Target, Mic, MicOff, 
  MessageCircle, Phone, PhoneOff, Loader2
} from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import FinancialTimelineChart from '@/components/FinancialTimelineChart';

const PREMIER_LEAGUE_CONTRACTS = () => {
  // Contract Agent State
  const [hasRequestedMicPermission, setHasRequestedMicPermission] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  
  // Player highlighting state for NICO
  const [highlightedPlayer, setHighlightedPlayer] = useState<string | null>(null);
  const [nicoActionFeedback, setNicoActionFeedback] = useState<string | null>(null);
  
  // Poll for NICO voice control commands
  useEffect(() => {
    let lastKnownUpdate = Date.now();
    
    const pollForNicoCommands = async () => {
      try {
        const response = await fetch('/api/voice-control', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const result = await response.json();
          const state = result.data;
          
          // Only update if there's been a change
          if (state.lastUpdate > lastKnownUpdate) {
            lastKnownUpdate = state.lastUpdate;
            
            console.log('🎮 NICO Command Received (Contracts):', state);
            
            // Update highlighted player if changed
            if (state.highlightedPlayer !== highlightedPlayer) {
              setHighlightedPlayer(state.highlightedPlayer);
              if (state.highlightedPlayer) {
                setNicoActionFeedback(`🎤 NICO highlighted ${state.highlightedPlayer}`);
              } else {
                setNicoActionFeedback(`🎤 NICO cleared player highlight`);
              }
              setTimeout(() => setNicoActionFeedback(null), 3000);
            }
          }
        }
      } catch (error) {
        console.error('Error polling for NICO commands:', error);
      }
    };
    
    // Poll every 5 seconds for NICO commands
    const interval = setInterval(pollForNicoCommands, 5000);
    
    return () => clearInterval(interval);
  }, [highlightedPlayer]);

  // Sample contract data (will be replaced by real database queries)
  const contractStats = {
    totalPlayers: 3,
    totalWageBill: 6240000, // Annual wage bill
    contractsExpiring2025: 1,
    contractsExpiring2026: 0,
    highestPaidPlayer: "Diogo Dalot",
    averageContractLength: 3.5
  };

  const upcomingExpirations = [
    {
      player: "André Onana",
      position: "Goalkeeper", 
      currentWage: "£10k/week",
      expiryDate: "30 June 2025",
      daysRemaining: 157,
      loyaltyBonus: "£20M",
      status: "Critical"
    }
  ];

  const contractHighlights = [
    {
      player: "Diogo Dalot",
      position: "Defender",
      currentWage: "£110k/week → £200k/week (option year)",
      contractEnd: "30 June 2028 (+1 option year)",
      keyClause: "£50M loyalty bonus due June 2025",
      riskLevel: "Medium"
    },
    {
      player: "Kobbie Mainoo", 
      position: "Midfielder",
      currentWage: "£45k/week",
      contractEnd: "30 June 2026",
      keyClause: "Academy graduate - homegrown status",
      riskLevel: "Low"
    }
  ];

  // Agent conversation handlers
  const requestMicrophonePermission = useCallback(async () => {
    setHasRequestedMicPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermissionGranted(false);
      return false;
    }
  }, []);

  // Contract Agent Conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to Contract Agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from Contract Agent');
    },
    onMessage: (message) => {
      console.log('Contract Agent message:', message);
    },
    onError: (error) => {
      console.error('Contract Agent error:', error);
    },
  });

  const startConversationWithAgent = useCallback(async () => {
    try {
      console.log('🎙️ Starting conversation with NICO...');
      
      if (!hasRequestedMicPermission) {
        console.log('🎤 Requesting microphone permission...');
        const granted = await requestMicrophonePermission();
        if (!granted) {
          console.log('❌ Microphone permission denied');
          return;
        }
        console.log('✅ Microphone permission granted');
      }
      
      console.log('🤖 Starting session with agent: agent_01jy1j8n36ee5rp8t5tv0p2nk7');
      
      // NICO - Premier League Contract Expert
      await conversation.startSession({
        agentId: 'agent_01jy1j8n36ee5rp8t5tv0p2nk7', // NICO Agent ID (confirmed to exist)
      });
      
      console.log('✅ NICO conversation started successfully');
    } catch (error) {
      console.error('❌ Failed to start conversation with NICO:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  }, [conversation, hasRequestedMicPermission, requestMicrophonePermission]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  }, [conversation]);

  const handleToggleAgent = async () => {
    if (conversation.status === 'connected') {
      endConversation();
    } else {
      await startConversationWithAgent();
    }
  };

  // Helper function to check if a player should be highlighted
  const isPlayerHighlighted = (playerName: string) => {
    if (!highlightedPlayer) return false;
    
    // Fuzzy matching for player names (case insensitive, partial matches)
    const normalizedHighlight = highlightedPlayer.toLowerCase();
    const normalizedPlayer = playerName.toLowerCase();
    
    return normalizedPlayer.includes(normalizedHighlight) || 
           normalizedHighlight.includes(normalizedPlayer) ||
           normalizedPlayer.split(' ').some(part => normalizedHighlight.includes(part)) ||
           normalizedHighlight.split(' ').some(part => normalizedPlayer.includes(part));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
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
              Aaran (EFL)
            </a>
            <a href="/contracts" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              Contracts (PL)
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Premier League Contract Intelligence
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Advanced contract analysis for Manchester United players with AI-powered insights
          </p>
          
          {/* NICO Action Feedback */}
          {nicoActionFeedback && (
            <div className="mt-4 mx-auto max-w-md">
              <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-lg p-3 text-yellow-100 text-sm backdrop-blur-sm">
                {nicoActionFeedback}
              </div>
            </div>
          )}
        </div>

        {/* Contract Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Players</p>
                <p className="text-3xl font-bold text-white">{contractStats.totalPlayers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Annual Wage Bill</p>
                <p className="text-3xl font-bold text-white">£{(contractStats.totalWageBill / 1000000).toFixed(1)}M</p>
              </div>
              <PoundSterling className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Expiring 2025</p>
                <p className="text-3xl font-bold text-white">{contractStats.contractsExpiring2025}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Avg Contract Length</p>
                <p className="text-3xl font-bold text-white">{contractStats.averageContractLength}y</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Contract Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Urgent Expirations */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              Urgent Contract Expirations
            </h3>
            <div className="space-y-4">
              {upcomingExpirations.map((contract, index) => {
                const isHighlighted = isPlayerHighlighted(contract.player);
                return (
                  <div 
                    key={index} 
                    className={`rounded-lg p-4 transition-all duration-300 ${
                      isHighlighted 
                        ? 'bg-yellow-500/20 border-2 border-yellow-400 shadow-lg shadow-yellow-400/20 animate-pulse' 
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}
                  >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className={`font-semibold ${isHighlighted ? 'text-yellow-100' : 'text-white'}`}>
                          {contract.player}
                          {isHighlighted && <span className="ml-2 text-yellow-400">⭐</span>}
                        </h4>
                        <p className={`text-sm ${isHighlighted ? 'text-yellow-200' : 'text-red-200'}`}>
                          {contract.position}
                        </p>
                    </div>
                      <span className={`text-white text-xs px-2 py-1 rounded ${
                        isHighlighted ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                      {contract.daysRemaining} days
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-200">Current: {contract.currentWage}</p>
                    <p className="text-blue-200">Expires: {contract.expiryDate}</p>
                    <p className="text-yellow-200">Loyalty: {contract.loyaltyBonus}</p>
                  </div>
                    {isHighlighted && (
                      <div className="mt-2 pt-2 border-t border-yellow-400/30">
                        <p className="text-yellow-200 text-xs font-medium">🎤 Highlighted by NICO</p>
                      </div>
                    )}
                </div>
                );
              })}
            </div>
          </div>

          {/* Contract Highlights */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 text-green-400 mr-2" />
              Secure Contracts
            </h3>
            <div className="space-y-4">
              {contractHighlights.map((contract, index) => {
                const isHighlighted = isPlayerHighlighted(contract.player);
                return (
                  <div 
                    key={index} 
                    className={`rounded-lg p-4 transition-all duration-300 ${
                      isHighlighted 
                        ? 'bg-yellow-500/20 border-2 border-yellow-400 shadow-lg shadow-yellow-400/20 animate-pulse' 
                        : 'bg-green-500/10 border border-green-500/20'
                    }`}
                  >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className={`font-semibold ${isHighlighted ? 'text-yellow-100' : 'text-white'}`}>
                          {contract.player}
                          {isHighlighted && <span className="ml-2 text-yellow-400">⭐</span>}
                        </h4>
                        <p className={`text-sm ${isHighlighted ? 'text-yellow-200' : 'text-green-200'}`}>
                          {contract.position}
                        </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                        isHighlighted ? 'bg-yellow-500 text-white' :
                      contract.riskLevel === 'Low' ? 'bg-green-500 text-white' :
                      contract.riskLevel === 'Medium' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {contract.riskLevel} Risk
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-200">Wage: {contract.currentWage}</p>
                    <p className="text-blue-200">Until: {contract.contractEnd}</p>
                    <p className="text-yellow-200">{contract.keyClause}</p>
                  </div>
                    {isHighlighted && (
                      <div className="mt-2 pt-2 border-t border-yellow-400/30">
                        <p className="text-yellow-200 text-xs font-medium">🎤 Highlighted by NICO</p>
                      </div>
                    )}
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Financial Timeline Chart */}
        <FinancialTimelineChart highlightedPlayer={highlightedPlayer} />

        {/* AI Assistant Call-to-Action */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
          <MessageCircle className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Ask NICO - Premier League Contract Expert
          </h3>
          <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
            Get instant insights about Manchester United contracts, wage structures, expiry dates, and transfer implications.
            Ask questions like &quot;Which players are out of contract this year?&quot; or &quot;What&apos;s our total wage bill?&quot;
          </p>
          <button
            className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
              conversation.status === 'connected' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={handleToggleAgent}
            disabled={conversation.status === 'connecting'}
          >
            {conversation.status === 'connected' ? (
              <>
                <PhoneOff className="h-5 w-5 mr-2 inline" />
                End Conversation
              </>
            ) : conversation.status === 'connecting' ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 inline animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="h-5 w-5 mr-2 inline" />
                Start Voice Conversation
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-blue-200 text-sm">
          <p>
            <strong>Premier League Contract Intelligence</strong> - Real-time contract analysis with AI-powered insights
          </p>
          <p className="mt-1">
            🎯 Manchester United player contracts • Wage analysis • Expiry tracking • Transfer impact assessment
          </p>
        </div>
      </div>

      {/* Voice Assistant Status (Fixed Position) */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-2 z-40">
        {/* Status Indicator */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur text-white px-2 py-1 rounded-full text-xs">
          {conversation.status === 'connected' && (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </>
          )}
          {conversation.status === 'connecting' && (
            <>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Connecting</span>
            </>
          )}
          {conversation.status === 'disconnected' && (
            <>
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <span>NICO</span>
            </>
          )}
          {conversation.status === 'connected' && conversation.isSpeaking && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
              <span>Speaking</span>
            </>
          )}
        </div>

        {/* Microphone Button */}
        <button
          className={`p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
            conversation.status === 'connected' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white`}
          onClick={handleToggleAgent}
          title={conversation.status === 'connected' ? "End conversation" : "Start conversation"} 
          disabled={conversation.status === 'connecting' || (!micPermissionGranted && hasRequestedMicPermission)}
        >
          {conversation.status === 'connected' ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PREMIER_LEAGUE_CONTRACTS;