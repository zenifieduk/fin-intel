"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Mic, MicOff, Trophy, Menu, X, Play, Volume2, PoundSterling, Shield, Clock
} from 'lucide-react';
import { defaultAaranAgent, type FinancialData } from '../../utils/aaran-agent';

// Extend Window interface for speech recognition
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/speech';

const EFL_LIQUIDITY_ANALYZER = () => {
  const [selectedPosition, setSelectedPosition] = useState(12);
  const [scenario, setScenario] = useState('current');
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize dashboard controller with UI callbacks
    defaultAaranAgent.initializeDashboard({
      onPositionChange: setSelectedPosition,
      onScenarioChange: setScenario
    });

    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setVoiceSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
      };
      
      recognition.onend = () => {
        console.log('🔚 Speech recognition ended');
        setIsListening(false);
        // NO automatic restart - user must manually restart
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
          
        if (event.results[event.results.length - 1].isFinal) {
          handleVoiceCommand(transcript.toLowerCase());
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        // NO automatic restart - user must manually restart
      };
      
      recognitionRef.current = recognition;
      synthRef.current = speechSynthesis;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ElevenLabs Text-to-speech function - simplified
  const speakText = useCallback(async (text: string) => {
    try {
      setIsPlaying(true); // Block new commands while speaking
      
      // Stop speech recognition before TTS
      if (recognitionRef.current && isListening) {
        console.log('🛑 Stopping speech recognition before TTS');
        recognitionRef.current.stop();
        setIsListening(false);
      }
      
      // Using ElevenLabs API for high-quality voice synthesis
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: 'CZ1JCWXlwX5dmHx0XdiL', // Adam - Professional conversational male voice
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Simple cleanup when audio ends
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlaying(false); // Re-enable command processing
          console.log('🔊 TTS finished - user can manually restart listening if needed');
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlaying(false); // Re-enable command processing on error
          console.log('⚠️ TTS error occurred');
        };
        
        await audio.play();
        console.log(`🔊 ElevenLabs speaking: "${text}"`);
      } else {
        console.error('ElevenLabs TTS failed:', response.statusText);
        setIsPlaying(false); // Re-enable command processing on failure
        console.log(`🔊 Aaran says: "${text}"`);
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsPlaying(false); // Re-enable command processing on error
      console.log(`🔊 Would speak: "${text}"`);
    }
  }, [isListening]);

  // Voice command handler with UI control - now powered by AaranAgent
  const handleVoiceCommand = useCallback(async (transcript: string) => {

    // Prevent processing commands while TTS is playing
    if (isPlaying) {
      console.log('🚫 Ignoring command while speaking:', transcript);
      return;
    }
    
    // Simple feedback prevention - just check for very long transcripts or obvious TTS echoes
    if (transcript.length > 100 || transcript.includes('million') && transcript.includes('revenue')) {
      console.log('🚫 Ignoring feedback:', transcript);
      return;
    }
    
    setLastCommand(transcript);
    console.log(`🎤 Processing command: "${transcript}"`);
    
    // Process through AaranAgent for intelligent context management
    const agentResult = await defaultAaranAgent.processVoiceCommand(
      transcript,
      { selectedPosition, scenario },
      {} as FinancialData // Use empty object to avoid circular dependency
    );
    
    const { response, newPosition, newScenario, shouldSpeak, context, intent } = agentResult;
    
    // Update states with smooth animation (newPosition and newScenario come from AaranAgent)
    if (newPosition !== undefined && newPosition !== selectedPosition) {
      animatePositionChange(selectedPosition, newPosition);
    }
    if (newScenario !== undefined && newScenario !== scenario) {
      setScenario(newScenario);
    }
    
    // Speak the response using ElevenLabs TTS (if the agent says we should)
    if (shouldSpeak && response) {
      speakText(response);
    }
    
    console.log(`🎯 Aaran executed: ${response}`);
    console.log(`📊 Agent context:`, {
      focus: context.currentFocus,
      lastAction: context.lastAction,
      historyLength: context.conversationHistory.length
    });
    console.log(`🧠 Intent classification:`, {
      type: intent.type,
      confidence: intent.confidence.toFixed(2),
      parameters: intent.parameters,
      reasoning: intent.reasoning
    });
  }, [isPlaying, selectedPosition, scenario, speakText]);

  // Animate position changes for dramatic effect
  const animatePositionChange = (fromPos: number, toPos: number) => {
    const steps = Math.abs(toPos - fromPos);
    const direction = toPos > fromPos ? 1 : -1;
    const delay = Math.min(200, 1000 / steps); // Smooth but not too slow
    
    let currentStep = 0;
    const animate = () => {
      if (currentStep < steps) {
        setSelectedPosition(fromPos + (direction * currentStep));
        currentStep++;
        setTimeout(animate, delay);
      } else {
        setSelectedPosition(toPos);
      }
    };
    animate();
  };

  // Simple voice control functions
  const startListening = () => {
    if (!recognitionRef.current) {
      console.warn('⚠️ Cannot start listening: no recognition available');
      return;
    }

    if (isListening) {
      console.warn('⚠️ Cannot start listening: already listening');
      return;
    }

    if (isPlaying) {
      console.warn('⚠️ Cannot start listening: TTS is playing');
      return;
    }

    try {
      console.log('🎤 Starting speech recognition');
      recognitionRef.current.start();
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log('🛑 Stopping speech recognition');
      recognitionRef.current.stop();
    }
  };

  // Demo commands function
  const runDemo = () => {
    speakText("Welcome to the EFL Financial Intelligence Platform. Let me demonstrate the financial impact of league positions.");
    
    setTimeout(() => {
      speakText("Starting at championship position");
      setSelectedPosition(1);
    }, 3000);
    
    setTimeout(() => {
      speakText("Moving to playoff qualification - notice the revenue premium");
      setSelectedPosition(6);
    }, 6000);
    
    setTimeout(() => {
      speakText("Now dropping to 7th place - watch the playoff cliff effect");
      setSelectedPosition(7);
    }, 9000);
    
    setTimeout(() => {
      speakText("Sliding into relegation battle - see the financial panic");
      setSelectedPosition(18);
    }, 12000);
    
    setTimeout(() => {
      speakText("And finally, relegated - financial catastrophe. This demonstrates why every position matters in Championship football.");
      setSelectedPosition(24);
    }, 15000);
  };

  // Real Championship club data based on research
  const baseClubData = useMemo(() => ({
    name: "Club DNA FC",
    currentRevenue: 22000000, // £22M average non-parachute club
    currentWages: 18500000,   // £18.5M (84% wage ratio)
    stadiumCapacity: 25000,
    currentCash: 3500000,     // £3.5M current cash
    monthlyBurnRate: 1800000  // £1.8M monthly operations
  }), []);

  // COMPREHENSIVE Championship Position Impact - All 24 Positions with Realistic Financial Dynamics
  const calculatePositionImpact = useMemo(() => (position: number) => {
    const baseRevenue = baseClubData.currentRevenue;
    
    // AUTOMATIC PROMOTION ZONE (1st-2nd): £200M+ Premier League Prize
    if (position <= 2) {
      const promotionBonus = position === 1 ? 12000000 : 11000000;
      const trophyPremium = position === 1 ? 2000000 : 0;
      const tvBonus = position === 1 ? 1200000 : 1100000;
      const commercialMultiplier = position === 1 ? 1.7 : 1.6;
      const renewalRate = position === 1 ? 0.98 : 0.95;
      const attendanceMultiplier = position === 1 ? 1.35 : 1.30;
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus + promotionBonus + trophyPremium + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        promotionBonus,
        trophyPremium,
        positionRisk: 'PROMOTION CERTAIN',
        wageRatio: 70 + (position * 2),
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate,
        riskScore: 10
      };
    }
    
    // PLAYOFF ZONE (3rd-6th): £200M+ Promotion Opportunity
    if (position <= 6) {
      const playoffProbability = position === 3 ? 0.35 : position === 4 ? 0.25 : position === 5 ? 0.20 : 0.15;
      const playoffPremium = Math.round(playoffProbability * 10000000);
      const tvBonus = 800000 + ((7 - position) * 50000);
      const commercialMultiplier = 1.35 + ((7 - position) * 0.025);
      const renewalRate = 0.88 + ((7 - position) * 0.01);
      const attendanceMultiplier = 1.10 + ((7 - position) * 0.02);
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus + playoffPremium + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        playoffPremium,
        playoffProbability,
        positionRisk: 'PLAYOFF CONTENTION',
        wageRatio: 75 + (position * 2),
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate,
        riskScore: 15 + (position * 5)
      };
    }
    
    // MID-TABLE AND RELEGATION ZONES
    if (position <= 12) {
      const playoffMissPenalty = position === 7 ? 1500000 : 0;
      const tvBonus = 400000 + ((13 - position) * 33333);
      const commercialMultiplier = 1.05 + ((13 - position) * 0.017);
      const renewalRate = 0.79 + ((13 - position) * 0.01);
      const attendanceMultiplier = 0.95 + ((13 - position) * 0.017);
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus - playoffMissPenalty + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        playoffMissPenalty,
        positionRisk: 'UPPER MID-TABLE',
        wageRatio: 85 + (position - 7) * 2,
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate,
        riskScore: 25 + (position * 3)
      };
    }
    
    // RELEGATION DANGER
    if (position <= 21) {
      const relegationFearPenalty = 2000000 + ((position - 18) * 500000);
      const tvBonus = 100000 + ((22 - position) * 25000);
      const commercialMultiplier = 0.70 + ((22 - position) * 0.038);
      const renewalRate = 0.55 + ((22 - position) * 0.025);
      const attendanceMultiplier = 0.65 + ((22 - position) * 0.038);
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus - relegationFearPenalty + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        relegationFearPenalty,
        positionRisk: 'RELEGATION BATTLE',
        wageRatio: 110 + (position - 18) * 5,
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate,
        riskScore: 80 + (position * 2)
      };
    }
    
    // RELEGATED ZONE (22nd-24th)
    const relegationPenalty = position === 24 ? 7000000 : position === 23 ? 6000000 : 5000000;
    const totalRevenue = Math.round(baseRevenue * 0.5 - relegationPenalty);
    
    return {
      totalRevenue,
      positionRisk: 'RELEGATED',
      wageRatio: 150 + (position - 22) * 10,
      monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate,
      riskScore: 100,
      commercialMultiplier: 0.5,
      renewalRate: 0.35,
      attendanceMultiplier: 0.5
    };
  }, [baseClubData]);

  // Current position data
  const currentData = useMemo(() => {
    const data = calculatePositionImpact(selectedPosition);
    return {
      ...data,
      adjustedRevenue: data.totalRevenue,
      monthlyCash: data.monthlyCashFlow,
      sustainabilityDays: data.monthlyCashFlow < 0 ? 
        Math.round(baseClubData.currentCash / Math.abs(data.monthlyCashFlow) * 30) : 999
    };
  }, [selectedPosition, calculatePositionImpact, baseClubData]);

  // Scenario data for different projections
  const scenarios = useMemo(() => ({
    optimistic: Array.from({ length: 24 }, (_, i) => {
      const pos = i + 1;
      const baseData = calculatePositionImpact(pos);
      return {
        position: pos,
        revenue: (baseData.totalRevenue * 1.15) / 1000000,
        probability: pos <= 6 ? 0.8 : pos <= 12 ? 0.6 : 0.3
      };
    }),
    current: Array.from({ length: 24 }, (_, i) => {
      const pos = i + 1;
      const baseData = calculatePositionImpact(pos);
      return {
        position: pos,
        revenue: baseData.totalRevenue / 1000000,
        probability: 0.5
      };
    }),
    pessimistic: Array.from({ length: 24 }, (_, i) => {
      const pos = i + 1;
      const baseData = calculatePositionImpact(pos);
      return {
        position: pos,
        revenue: (baseData.totalRevenue * 0.85) / 1000000,
        probability: pos >= 18 ? 0.8 : pos >= 12 ? 0.6 : 0.3
      };
    })
  }), [calculatePositionImpact]);

  // League table data for visualization
  const leagueTableData = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => {
      const pos = i + 1;
      const data = calculatePositionImpact(pos);
      const monthlyCashFlow = data.monthlyCashFlow;
      const wageRatio = data.wageRatio;
      
      return {
        position: pos,
        revenue: data.totalRevenue / 1000000,
        cashFlow: Math.round(monthlyCashFlow / 1000),
        wageRatio: Math.round(wageRatio * 10) / 10,
        risk: pos >= 22 ? 100 : pos >= 18 ? 80 : pos >= 15 ? 50 : pos >= 12 ? 25 : pos >= 7 ? 15 : 10,
        positionRisk: data.positionRisk,
        sustainabilityDays: monthlyCashFlow < 0 ? Math.round(baseClubData.currentCash / Math.abs(monthlyCashFlow) * 30) : 999,
        commercialMultiplier: Math.round(data.commercialMultiplier * 100) / 100,
        renewalRate: Math.round(data.renewalRate * 100),
        tvBonus: Math.round((data.tvBonus || 0) / 1000)
      };
    }), [calculatePositionImpact, baseClubData]
  );

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'LOW', color: 'text-green-600' };
    if (score <= 60) return { level: 'MEDIUM', color: 'text-yellow-600' };
    return { level: 'HIGH', color: 'text-red-600' };
  };

  const risk = getRiskLevel(currentData.riskScore || 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EFL Financial Intelligence Platform
                </h1>
                <p className="text-blue-200">Voice-controlled position impact analysis with AI-powered insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {voiceSupported && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    title={isListening ? 'Stop Voice Control' : 'Start Voice Control'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={runDemo}
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500 hover:bg-purple-600 transition-all duration-200"
                    title="Run Voice Demo"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="hidden md:block text-sm text-blue-200">
                Season: 2024/25 • Week 23 • {new Date().toLocaleDateString('en-GB')}
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex space-x-6">
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
            <a href="/frf7" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              FRF7 Voice Control
            </a>
          </nav>
        </div>
      </div>

      {/* Voice Status Bar */}
      {voiceSupported && (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-200">Voice Control:</span>
                  <span className={`text-sm font-medium ${
                    isListening ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {isListening ? 'LISTENING...' : 'Ready'}
                  </span>
                </div>
                {lastCommand && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-200">Last Command:</span>
                    <span className="text-sm text-white font-medium">&quot;{lastCommand}&quot;</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-blue-200">
                Say: &quot;Position 6&quot;, &quot;Playoff&quot;, &quot;Relegation zone&quot;, &quot;Best case&quot;, etc.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Voice-Controlled Championship Financial Intelligence
          </h2>
          <p className="text-xl text-blue-200 mb-6">
            Advanced voice interaction with real-time financial impact analysis
          </p>
        </div>

        {/* Voice Commands Help */}
        {voiceSupported && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-white/20 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Mic className="w-5 h-5 mr-2 text-cyan-400" />
              Voice Commands Available
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-200">Position Control</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>&quot;Position 6&quot; - Move to specific position</li>
                  <li>&quot;Champions&quot; - Go to 1st place</li>
                  <li>&quot;Playoff&quot; - Go to playoff positions</li>
                  <li>&quot;Mid table&quot; - Go to position 12</li>
                  <li>&quot;Relegation zone&quot; - Go to bottom 3</li>
                  <li>&quot;Move up/down&quot; - Adjacent positions</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-yellow-200">Scenario Analysis</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>&quot;Best case&quot; - Optimistic scenario</li>
                  <li>&quot;Worst case&quot; - Pessimistic scenario</li>
                  <li>&quot;Current&quot; - Base case scenario</li>
                  <li>&quot;Promotion push&quot; - Optimistic view</li>
                  <li>&quot;Relegation scenario&quot; - Pessimistic view</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-200">Data Queries</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>&quot;What revenue&quot; - Current revenue info</li>
                  <li>&quot;What risk&quot; - Current risk assessment</li>
                  <li>&quot;Show the cliff&quot; - Demonstrate cliff effects</li>
                  <li>&quot;Compare position X&quot; - Position comparison</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <label className="block text-sm font-medium mb-2">League Position</label>
            <input
              type="range"
              min="1"
              max="24"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1st</span>
              <span>{selectedPosition}</span>
              <span>24th</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <label className="block text-sm font-medium mb-2">Scenario Analysis</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="optimistic">Best Case (Promotion Push)</option>
              <option value="current">Current Trajectory</option>
              <option value="pessimistic">Worst Case (Relegation Battle)</option>
            </select>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <label className="block text-sm font-medium mb-2">Voice Control</label>
            <div className="space-y-2">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isPlaying}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isPlaying ? 'Aaran Speaking...' : isListening ? '🔴 Stop Listening' : '🎤 Start Listening'}
              </button>
              {lastCommand && (
                <div className="text-xs text-gray-400 truncate">
                  Last: &quot;{lastCommand}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Position Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Current Position</h3>
              <Trophy className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">{selectedPosition}</div>
            <div className="text-sm text-gray-300">{currentData.positionRisk}</div>
          </div>

          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Annual Revenue</h3>
              <PoundSterling className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              £{(currentData.adjustedRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-300">
              {currentData.monthlyCash >= 0 ? 'Profitable' : 'Loss Making'}
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Risk Level</h3>
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${risk.color}`}>
              {risk.level}
            </div>
            <div className="text-sm text-gray-300">Wage Ratio: {currentData.wageRatio.toFixed(1)}%</div>
          </div>

          <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sustainability</h3>
              <Clock className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400 mb-2">
              {currentData.sustainabilityDays > 365 ? '∞' : currentData.sustainabilityDays}
            </div>
            <div className="text-sm text-gray-300">
              {currentData.sustainabilityDays > 365 ? 'Sustainable' : 'Days left'}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue by Position Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4">Revenue by League Position</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={scenarios[scenario as keyof typeof scenarios]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="position" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fill="url(#blueGradient)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Analysis */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4">Position Risk Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leagueTableData.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="position" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="risk" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Cliff Analysis */}
        <div className="bg-gradient-to-r from-red-600/20 to-orange-500/20 rounded-xl p-6 border-2 border-red-400/30 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            ⚠️ <span className="ml-2 text-red-300">Championship Financial Cliff Points</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-red-900/30 rounded-lg p-4 border border-red-400/20">
              <h4 className="font-bold text-red-200 mb-2">6th → 7th Position</h4>
              <div className="text-xl font-bold text-red-400">-£1.5M</div>
              <p className="text-xs text-red-300">Missing £200M+ playoff opportunity</p>
            </div>
            
            <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-400/20">
              <h4 className="font-bold text-orange-200 mb-2">12th → 13th Position</h4>
              <div className="text-xl font-bold text-orange-400">-£400K</div>
              <p className="text-xs text-orange-300">Entering anxiety zone</p>
            </div>
            
            <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-400/20">
              <h4 className="font-bold text-amber-200 mb-2">17th → 18th Position</h4>
              <div className="text-xl font-bold text-amber-400">-£900K</div>
              <p className="text-xs text-amber-300">Relegation battle begins</p>
            </div>
            
            <div className="bg-red-800/30 rounded-lg p-4 border border-red-500/20">
              <h4 className="font-bold text-red-200 mb-2">21st → 22nd Position</h4>
              <div className="text-xl font-bold text-red-500">-£1.2M</div>
              <p className="text-xs text-red-300">Relegation confirmed</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-200 text-sm">
          <p>
            <strong>EFL Financial Intelligence Platform - Voice Control Edition</strong>
          </p>
          <p className="mt-1">
            🎯 Advanced voice interaction • Real-time financial modeling • AI-powered insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default EFL_LIQUIDITY_ANALYZER;