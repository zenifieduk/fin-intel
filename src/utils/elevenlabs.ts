/**
 * ElevenLabs Text-to-Speech Integration Utility
 * Ready for MCP integration when available
 */

export interface ElevenLabsConfig {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export const DEFAULT_CONFIG: ElevenLabsConfig = {
  voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - Professional conversational voice
  modelId: 'eleven_turbo_v2_5',
  stability: 0.5,
  similarityBoost: 0.8,
  style: 0.2,
  useSpeakerBoost: true
};

/**
 * ElevenLabs TTS using MCP tools (when available)
 */
export async function elevenLabsSpeak(
  text: string, 
  _config: ElevenLabsConfig = DEFAULT_CONFIG
): Promise<boolean> {
  try {
    // This function will integrate with ElevenLabs MCP tools
    // For now, it returns false to fall back to browser TTS
    
    // TODO: Integrate with ElevenLabs MCP server when available
    // Example MCP call structure:
    /*
    const response = await mcpCall('elevenlabs', 'text-to-speech', {
      text,
      voice_id: config.voiceId,
      model_id: config.modelId,
      voice_settings: {
        stability: config.stability,
        similarity_boost: config.similarityBoost,
        style: config.style,
        use_speaker_boost: config.useSpeakerBoost
      }
    });
    
    if (response.success) {
      const audioBlob = new Blob([response.audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.volume = 0.8;
      await audio.play();
      
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });
      
      return true;
    }
    */
    
    console.log('🤖 ElevenLabs MCP not yet integrated, falling back to browser TTS');
    return false;
    
  } catch (error) {
    console.warn('ElevenLabs TTS failed:', error);
    return false;
  }
}

/**
 * Enhanced browser TTS fallback with professional voice selection
 */
export function browserSpeak(text: string): void {
  const synth = window.speechSynthesis;
  
  if (!synth) {
    console.warn('Speech synthesis not supported');
    return;
  }
  
  // Cancel any ongoing speech
  synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;
  
  // Enhanced voice selection
  const voices = synth.getVoices();
  const preferredVoices = [
    'Daniel', 'Alex', 'Google UK English Male',
    'Microsoft David Desktop', 'Google UK English Female',
    'Samantha', 'Karen', 'Moira', 'Victoria', 'Thomas'
  ];
  
  let selectedVoice = null;
  for (const preferred of preferredVoices) {
    selectedVoice = voices.find(voice => 
      voice.name.includes(preferred) && voice.lang.includes('en')
    );
    if (selectedVoice) break;
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    console.log(`🎙️ Browser TTS using: ${selectedVoice.name}`);
  }
  
  utterance.addEventListener('start', () => {
    console.log(`🔊 Speaking: "${text}"`);
  });
  
  synth.speak(utterance);
}

/**
 * Main TTS function that tries ElevenLabs first, then falls back to browser TTS
 * Includes callback support for speech recognition pause/resume
 */
export async function speak(
  text: string, 
  config?: ElevenLabsConfig,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  // Notify start of speech (to pause recognition)
  callbacks?.onStart?.();
  
  try {
    // Try ElevenLabs MCP first
    const elevenLabsSuccess = await elevenLabsSpeak(text, config);
    
    // Fallback to browser TTS if ElevenLabs not available
    if (!elevenLabsSuccess) {
      await browserSpeakWithCallback(text, callbacks?.onEnd);
    }
    // Note: ElevenLabs integration will handle callbacks when implemented
  } catch (error) {
    console.error('TTS error:', error);
    callbacks?.onEnd?.();
  }
}

/**
 * Enhanced browser TTS with callback support
 */
async function browserSpeakWithCallback(text: string, onEnd?: () => void): Promise<void> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    
    if (!synth) {
      console.warn('Speech synthesis not supported');
      onEnd?.();
      resolve();
      return;
    }
    
    // Cancel any ongoing speech
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Enhanced voice selection
    const voices = synth.getVoices();
    const preferredVoices = [
      'Daniel', 'Alex', 'Google UK English Male',
      'Microsoft David Desktop', 'Google UK English Female',
      'Samantha', 'Karen', 'Moira', 'Victoria', 'Thomas'
    ];
    
    let selectedVoice = null;
    for (const preferred of preferredVoices) {
      selectedVoice = voices.find(voice => 
        voice.name.includes(preferred) && voice.lang.includes('en')
      );
      if (selectedVoice) break;
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`🎙️ Browser TTS using: ${selectedVoice.name}`);
    }
    
    utterance.addEventListener('start', () => {
      console.log(`🔊 Speaking: "${text}"`);
    });
    
    utterance.addEventListener('end', () => {
      console.log('🔇 Speech completed');
      onEnd?.();
      resolve();
    });
    
    utterance.addEventListener('error', () => {
      console.error('Speech synthesis error');
      onEnd?.();
      resolve();
    });
    
    synth.speak(utterance);
  });
} 