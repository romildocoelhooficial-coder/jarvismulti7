export type AssistantStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'SLEEPING';

export interface SysMetrics {
  cpu: number;
  mem: number;
  net: number;
  gpu: number;
  tmp: number;
  fps: number;
}

export interface MemoryEntry {
  id: string;
  category: 'identity' | 'preferences' | 'projects' | 'relationships' | 'wishes' | 'notes';
  key: string;
  value: string;
  updated: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'USER' | 'JARVIS' | 'SYSTEM' | 'TOOL' | 'TELEMETRY' | 'SECURITY';
  text: string;
  detail?: string;
  status?: 'done' | 'unverified' | 'failed' | 'started';
}

export type ToolOutcome = 'done' | 'unverified' | 'failed' | 'ask' | 'started';

export interface DynamicContent {
  id: string;
  type: 'search' | 'news' | 'weather' | 'flight' | 'system' | 'video' | 'file' | 'clipboard';
  title: string;
  subtitle?: string;
  data: any;
  timestamp: string;
}

export interface ProviderConfig {
  engineMode: 'gemini' | 'pipeline';
  sttProvider: 'whisper' | 'webspeech' | 'cloud_whisper';
  llmProvider: 'gemini' | 'ollama' | 'openai' | 'groq' | 'deepseek';
  ttsProvider: 'piper' | 'system' | 'elevenlabs';
  llmAddress: string;
  llmModel: string;
  apiKey: string;
  toolBudget: 'unlimited' | 'balanced' | 'compact';
  filterThinking: boolean;
}

export interface AssistantCustomization {
  assistantName: string;
  userName: string;
  accentColor: string; // Hex e.g. #00d4ff
  voiceName: string;   // 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede'
  wakeWordEnabled: boolean;
  pushToTalkEnabled: boolean;
  proactiveBriefingEnabled: boolean;
}

export interface AudioDeviceConfig {
  inputDeviceId: string;
  outputDeviceId: string;
  inputVolume: number;
  outputVolume: number;
}

export interface ConfirmationRequest {
  id: string;
  title: string;
  actionName: string;
  description: string;
  severity: 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}
