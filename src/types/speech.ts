 // TypeScript interfaces for Web Speech API
// Provides type safety for SpeechRecognition and SpeechSynthesis

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  0: SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

export interface SpeechRecognition extends EventTarget {
  // Properties
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;

  // Event handlers
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;

  // Methods
  abort(): void;
  start(): void;
  stop(): void;
}

export interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
  readonly prototype: SpeechRecognition;
}

export interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
}

export interface SpeechGrammar {
  src: string;
  weight: number;
}

// Extend Window interface for browser speech APIs
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
    SpeechGrammarList: {
      new(): SpeechGrammarList;
      prototype: SpeechGrammarList;
    } | undefined;
    webkitSpeechGrammarList: {
      new(): SpeechGrammarList;
      prototype: SpeechGrammarList;
    } | undefined;
  }
}

// Helper type for speech synthesis with proper voice interface
export interface SpeechSynthesisVoiceExtended extends SpeechSynthesisVoice {
  readonly default: boolean;
  readonly lang: string;
  readonly localService: boolean;
  readonly name: string;
  readonly voiceURI: string;
}

// Message interface for conversation systems
export interface ConversationMessage {
  message?: string;
  text?: string;
  content?: string;
  transcript?: string;
  response?: string;
  type?: string;
  timestamp?: Date;
  id?: string;
} 