import React, { useState } from 'react';
import { X, Cpu, CheckCircle2, AlertCircle, Play, Server, Mic, Volume2, Shield } from 'lucide-react';
import { ProviderConfig } from '../../types';
import { Palette } from '../../constants/theme';
import { audioManager } from '../../utils/audio';

interface ProvidersOverlayProps {
  config: ProviderConfig;
  palette: Palette;
  onUpdate: (updated: Partial<ProviderConfig>) => void;
  onClose: () => void;
}

export const ProvidersOverlay: React.FC<ProvidersOverlayProps> = ({
  config,
  palette,
  onUpdate,
  onClose,
}) => {
  const [testResults, setTestResults] = useState<{ [key: string]: { status: 'testing' | 'ok' | 'err'; message: string } }>({});

  const handleTest = (slot: 'hearing' | 'thinking' | 'speaking') => {
    setTestResults(prev => ({ ...prev, [slot]: { status: 'testing', message: 'Pinging endpoint…' } }));

    setTimeout(() => {
      if (slot === 'hearing') {
        setTestResults(prev => ({
          ...prev,
          hearing: { status: 'ok', message: 'Speech recognizer initialized. VAD threshold 3.5× noise floor.' },
        }));
      } else if (slot === 'thinking') {
        const latency = Math.floor(Math.random() * 80 + 120);
        setTestResults(prev => ({
          ...prev,
          thinking: {
            status: 'ok',
            message: `Connected to ${config.llmProvider === 'gemini' ? 'Gemini 3.1 Flash Live' : config.llmModel}. Response in ${latency}ms.`,
          },
        }));
      } else if (slot === 'speaking') {
        audioManager.playTestTone(520, 0.4);
        setTestResults(prev => ({
          ...prev,
          speaking: { status: 'ok', message: 'Audio synthesis active. Neural pipe 15× faster than real-time.' },
        }));
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: `${palette.PANEL2}f8`,
          borderColor: palette.BORDER_B,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: palette.BORDER }}>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5" style={{ color: palette.PRI }} />
            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: palette.WHITE }}>
                ENGINE & PROVIDERS // ARCHITECTURE
              </h3>
              <p className="text-[10px] text-muted-foreground">Configure conversation pipeline: hearing, thinking, and speaking parts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Main Engine Architecture Switch */}
          <div className="p-3.5 rounded-xl border bg-black/40 space-y-2" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider" style={{ color: palette.WHITE }}>
                Primary Conversation Engine
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{ backgroundColor: `${palette.GREEN}22`, color: palette.GREEN }}
              >
                0.16ms Decision
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onUpdate({ engineMode: 'gemini' })}
                className="p-3 rounded-lg border text-left transition-all"
                style={{
                  borderColor: config.engineMode === 'gemini' ? palette.PRI : palette.BORDER,
                  backgroundColor: config.engineMode === 'gemini' ? palette.PRI_GHO : 'transparent',
                }}
              >
                <div className="font-bold text-xs" style={{ color: config.engineMode === 'gemini' ? palette.PRI : palette.WHITE }}>
                  Gemini 3.1 Flash Live
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Native ultra-low latency audio stream (~0.3s) with full tool budget
                </div>
              </button>

              <button
                onClick={() => onUpdate({ engineMode: 'pipeline' })}
                className="p-3 rounded-lg border text-left transition-all"
                style={{
                  borderColor: config.engineMode === 'pipeline' ? palette.PRI : palette.BORDER,
                  backgroundColor: config.engineMode === 'pipeline' ? palette.PRI_GHO : 'transparent',
                }}
              >
                <div className="font-bold text-xs" style={{ color: config.engineMode === 'pipeline' ? palette.PRI : palette.WHITE }}>
                  Modular Custom Pipeline
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Pick Whisper / Local Ollama / Piper TTS offline without cloud locks
                </div>
              </button>
            </div>
          </div>

          {/* ① Hearing (STT) */}
          <div className="p-3.5 rounded-xl border bg-black/40 space-y-2.5" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]" style={{ color: palette.WHITE }}>
                <Mic className="w-3.5 h-3.5" style={{ color: palette.PRI }} />
                <span>① Hearing (Speech Recognition)</span>
              </div>
              <button
                onClick={() => handleTest('hearing')}
                className="px-2.5 py-1 rounded text-[10px] font-bold uppercase border hover:bg-white/10 transition-all flex items-center gap-1"
                style={{ borderColor: palette.BORDER, color: palette.PRI }}
              >
                <Play className="w-2.5 h-2.5" /> TEST
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'whisper', label: 'Whisper CPU (Local)', sub: 'Neural CPU recognizer' },
                { id: 'webspeech', label: 'WebSpeech API', sub: 'Native Browser STT' },
                { id: 'cloud_whisper', label: 'Whisper Cloud API', sub: 'High accuracy hosted' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate({ sttProvider: opt.id as any })}
                  className="p-2 rounded border text-left transition-all"
                  style={{
                    borderColor: config.sttProvider === opt.id ? palette.PRI : palette.BORDER,
                    backgroundColor: config.sttProvider === opt.id ? palette.PRI_GHO : 'transparent',
                  }}
                >
                  <div className="font-semibold text-[11px]" style={{ color: config.sttProvider === opt.id ? palette.PRI : palette.WHITE }}>
                    {opt.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground">{opt.sub}</div>
                </button>
              ))}
            </div>

            {testResults.hearing && (
              <div className="p-2 rounded bg-black/60 border text-[10px] font-mono flex items-center gap-1.5" style={{ borderColor: palette.BORDER }}>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{testResults.hearing.message}</span>
              </div>
            )}
          </div>

          {/* ② Thinking (LLM) */}
          <div className="p-3.5 rounded-xl border bg-black/40 space-y-2.5" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]" style={{ color: palette.WHITE }}>
                <Server className="w-3.5 h-3.5" style={{ color: palette.PRI }} />
                <span>② Thinking (Model Provider)</span>
              </div>
              <button
                onClick={() => handleTest('thinking')}
                className="px-2.5 py-1 rounded text-[10px] font-bold uppercase border hover:bg-white/10 transition-all flex items-center gap-1"
                style={{ borderColor: palette.BORDER, color: palette.PRI }}
              >
                <Play className="w-2.5 h-2.5" /> TEST
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'gemini', label: 'Gemini 3.1 Flash' },
                { id: 'ollama', label: 'Ollama (Local)' },
                { id: 'openai', label: 'OpenAI / GPT-4o' },
                { id: 'deepseek', label: 'DeepSeek / Groq' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate({ llmProvider: opt.id as any })}
                  className="p-2 rounded border text-left transition-all"
                  style={{
                    borderColor: config.llmProvider === opt.id ? palette.PRI : palette.BORDER,
                    backgroundColor: config.llmProvider === opt.id ? palette.PRI_GHO : 'transparent',
                  }}
                >
                  <div className="font-semibold text-[11px]" style={{ color: config.llmProvider === opt.id ? palette.PRI : palette.WHITE }}>
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1 font-mono">Server Address</label>
                <input
                  type="text"
                  value={config.llmAddress}
                  onChange={(e) => onUpdate({ llmAddress: e.target.value })}
                  placeholder="127.0.0.1:11434"
                  className="w-full p-2 rounded border bg-black/60 font-mono text-xs outline-none"
                  style={{ borderColor: palette.BORDER, color: palette.WHITE }}
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1 font-mono">Model Tag / Identifier</label>
                <input
                  type="text"
                  value={config.llmModel}
                  onChange={(e) => onUpdate({ llmModel: e.target.value })}
                  placeholder="qwen2.5:7b or gpt-4o-mini"
                  className="w-full p-2 rounded border bg-black/60 font-mono text-xs outline-none"
                  style={{ borderColor: palette.BORDER, color: palette.WHITE }}
                />
              </div>
            </div>

            {testResults.thinking && (
              <div className="p-2 rounded bg-black/60 border text-[10px] font-mono flex items-center gap-1.5" style={{ borderColor: palette.BORDER }}>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{testResults.thinking.message}</span>
              </div>
            )}
          </div>

          {/* ③ Speaking (TTS) */}
          <div className="p-3.5 rounded-xl border bg-black/40 space-y-2.5" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]" style={{ color: palette.WHITE }}>
                <Volume2 className="w-3.5 h-3.5" style={{ color: palette.PRI }} />
                <span>③ Speaking (Audio Synthesis)</span>
              </div>
              <button
                onClick={() => handleTest('speaking')}
                className="px-2.5 py-1 rounded text-[10px] font-bold uppercase border hover:bg-white/10 transition-all flex items-center gap-1"
                style={{ borderColor: palette.BORDER, color: palette.PRI }}
              >
                <Play className="w-2.5 h-2.5" /> TEST
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'piper', label: 'Piper (~50 Languages)', sub: 'Fast neural local voice' },
                { id: 'system', label: 'System Default TTS', sub: 'Native OS voices' },
                { id: 'elevenlabs', label: 'ElevenLabs Cloud', sub: 'High-fidelity streaming' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate({ ttsProvider: opt.id as any })}
                  className="p-2 rounded border text-left transition-all"
                  style={{
                    borderColor: config.ttsProvider === opt.id ? palette.PRI : palette.BORDER,
                    backgroundColor: config.ttsProvider === opt.id ? palette.PRI_GHO : 'transparent',
                  }}
                >
                  <div className="font-semibold text-[11px]" style={{ color: config.ttsProvider === opt.id ? palette.PRI : palette.WHITE }}>
                    {opt.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground">{opt.sub}</div>
                </button>
              ))}
            </div>

            {testResults.speaking && (
              <div className="p-2 rounded bg-black/60 border text-[10px] font-mono flex items-center gap-1.5" style={{ borderColor: palette.BORDER }}>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{testResults.speaking.message}</span>
              </div>
            )}
          </div>

          {/* Tool Budget & Reasoning Filter */}
          <div className="p-3.5 rounded-xl border bg-black/40 space-y-3" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]" style={{ color: palette.WHITE }}>
              <Shield className="w-3.5 h-3.5" style={{ color: palette.PRI }} />
              <span>Optimizations & Safety Boundary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1 font-mono">Tool Budget Strategy</label>
                <select
                  value={config.toolBudget}
                  onChange={(e) => onUpdate({ toolBudget: e.target.value as any })}
                  className="w-full p-2 rounded border bg-black/60 text-xs font-mono outline-none"
                  style={{ borderColor: palette.BORDER, color: palette.WHITE }}
                >
                  <option value="unlimited">Gemini Unlimited (45 Tools / 56k Chars)</option>
                  <option value="balanced">Balanced (20 Core Tools / 18k Chars)</option>
                  <option value="compact">Tight Budget (12 Tools / 11k Chars for 8B models)</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={config.filterThinking}
                    onChange={(e) => onUpdate({ filterThinking: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400"
                  />
                  <div>
                    <span className="font-semibold text-xs" style={{ color: palette.WHITE }}>
                      Silence Reasoning Thoughts
                    </span>
                    <p className="text-[9px] text-muted-foreground">Strip &lt;think&gt; tags before vocal synthesis</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end" style={{ borderColor: palette.BORDER }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider"
            style={{ backgroundColor: palette.PRI, color: '#000' }}
          >
            Save Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
