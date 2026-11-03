import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Settings,
  Brain,
  Headphones,
  Palette as PaletteIcon,
  Smartphone,
  Clipboard,
  Shield,
  Volume2,
  Terminal,
  Activity,
  Maximize2,
  Minimize2,
  Radio,
  FileText,
  Download,
} from 'lucide-react';
import {
  AssistantStatus,
  SysMetrics,
  MemoryEntry,
  LogEntry,
  DynamicContent,
  ProviderConfig,
  AssistantCustomization,
  AudioDeviceConfig,
  ConfirmationRequest,
} from './types';
import { DEFAULT_PALETTE, deriveThemePalette } from './constants/theme';
import { audioManager } from './utils/audio';
import { speechEngine } from './utils/speech';
import { JarvisBrain } from './utils/jarvisBrain';
import { HudCanvas } from './components/HudCanvas';
import { MetricsBar } from './components/MetricsBar';
import { LogWidget } from './components/LogWidget';
import { ChatInput } from './components/ChatInput';
import { DynamicCard } from './components/DynamicCard';
import { CustomizeOverlay } from './components/overlays/CustomizeOverlay';
import { MemoryOverlay } from './components/overlays/MemoryOverlay';
import { ProvidersOverlay } from './components/overlays/ProvidersOverlay';
import { AudioDeviceOverlay } from './components/overlays/AudioDeviceOverlay';
import { RemoteKeyOverlay } from './components/overlays/RemoteKeyOverlay';
import { ConfirmBanner } from './components/overlays/ConfirmBanner';
import { ClipboardPanel } from './components/overlays/ClipboardPanel';
import { FileDropZone } from './components/overlays/FileDropZone';
import { AuthModal, UserSession } from './components/overlays/AuthModal';
import { AdminPanelOverlay } from './components/overlays/AdminPanelOverlay';
import { CameraVisionOverlay } from './components/overlays/CameraVisionOverlay';
import { LocalFolderSearchModal } from './components/overlays/LocalFolderSearchModal';
import { User, LogOut, Camera, FolderSearch, AlertTriangle, X } from 'lucide-react';

export const App: React.FC = () => {
  // Theme & Customization
  const [customization, setCustomization] = useState<AssistantCustomization>(() => {
    const saved = localStorage.getItem('jarvis_customization');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return {
      assistantName: 'JARVIS',
      userName: 'Senhor',
      accentColor: '#00d4ff',
      voiceName: 'Puck',
      wakeWordEnabled: true,
      pushToTalkEnabled: true,
      proactiveBriefingEnabled: true,
    };
  });

  const palette = useMemo(() => {
    return deriveThemePalette(customization.accentColor);
  }, [customization.accentColor]);

  // Provider configuration (Engine & Providers)
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(() => {
    const saved = localStorage.getItem('jarvis_providers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return {
      engineMode: 'gemini',
      sttProvider: 'whisper',
      llmProvider: 'gemini',
      ttsProvider: 'piper',
      llmAddress: '127.0.0.1:11434',
      llmModel: 'gemini-3.8-flash',
      apiKey: '',
      toolBudget: 'unlimited',
      filterThinking: true,
    };
  });

  // Audio Device Configuration
  const [audioConfig, setAudioConfig] = useState<AudioDeviceConfig>({
    inputDeviceId: '',
    outputDeviceId: '',
    inputVolume: 1.0,
    outputVolume: 0.85,
  });

  // Status and Speech State
  const [status, setStatus] = useState<AssistantStatus>('IDLE');
  const [statusText, setStatusText] = useState('SISTEMAS OPERACIONAIS EM PRONTIDÃO');
  const [speechLevel, setSpeechLevel] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [latencyMs, setLatencyMs] = useState(140);

  // Dynamic Content Card
  const [dynamicContent, setDynamicContent] = useState<DynamicContent | null>(null);

  // Confirmation Request
  const [confirmReq, setConfirmReq] = useState<ConfirmationRequest | null>(null);

  // User Auth & Admin Panel State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('jarvis_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return {
      id: 1,
      nome: 'Romildo Coelho',
      email: 'romildocoelhooficial@gmail.com',
      papel: 'admin',
      status: 'ativo',
    };
  });

  const [activeVoiceId, setActiveVoiceId] = useState<string>(() => {
    return localStorage.getItem('jarvis_active_voice_id') || '82d13948027e4be69892dd3d0104e681';
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showFolderSearchModal, setShowFolderSearchModal] = useState(false);
  const [restrictionNotice, setRestrictionNotice] = useState<string | null>(null);

  // Nickname personalizado da sessão (para usuário comum chamar pelo nome sem alterar o Admin)
  const [sessionUserNick, setSessionUserNick] = useState<string>(() => {
    return localStorage.getItem('jarvis_session_nickname') || '';
  });

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalledPwa, setIsInstalledPwa] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalledPwa(true);
    }
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalledPwa(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert('Para instalar o JARVIS PWA no seu dispositivo:\n• No Chrome/Edge: Clique no botão de instalar na barra de navegação.\n• No Safari iOS: Toque em Compartilhar e selecione "Adicionar à Tela de Início".');
    }
  };

  // Overlays
  const [activeOverlay, setActiveOverlay] = useState<
    'none' | 'customize' | 'memory' | 'providers' | 'audio' | 'remote' | 'clipboard' | 'file'
  >('none');

  // Logs Feed
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      source: 'SYSTEM',
      text: 'Kernel Mark LVI inicializado. Conexão direta com a API Google AI Studio ativa (pt-BR por padrão).',
      status: 'done',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      source: 'SECURITY',
      text: 'Portão de segurança ativo. Limite de conteúdo não confiável e confirmações manuais armados.',
      status: 'done',
    },
    {
      id: 'init-3',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      source: 'JARVIS',
      text: 'Mark LVI online. Calibração da malha facial e áudio em Português do Brasil concluídas.',
    },
  ]);

  // Persistent Recallable Memory Matrix
  const [memories, setMemories] = useState<MemoryEntry[]>(() => {
    const saved = localStorage.getItem('jarvis_memories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      {
        id: 'mem-1',
        category: 'identity',
        key: 'assistant_role',
        value: 'Autonomous cross-platform voice AI assistant and operator.',
        updated: '2026-11-01',
      },
      {
        id: 'mem-2',
        category: 'preferences',
        key: 'vocal_style',
        value: 'Level tone, dry understatement, concrete facts, no apologies.',
        updated: '2026-11-01',
      },
      {
        id: 'mem-3',
        category: 'projects',
        key: 'current_architecture',
        value: 'Mark LVI with modular 4-slot provider stack, holographic avatar, and zero-import overhead.',
        updated: '2026-11-01',
      },
    ];
  });

  // System Hardware Telemetry
  const [metrics, setMetrics] = useState<SysMetrics>({
    cpu: 18,
    mem: 42,
    net: 1.4,
    gpu: 24,
    tmp: 46,
    fps: 60,
  });

  // Effective user name: ALWAYS uses the FIRST name of the registered user as treatment
  const effectiveUserName = useMemo(() => {
    if (sessionUserNick) return sessionUserNick.trim().split(/\s+/)[0];
    if (currentUser?.nome) {
      return currentUser.nome.trim().split(/\s+/)[0];
    }
    if (customization.userName) {
      return customization.userName.trim().split(/\s+/)[0];
    }
    return 'Senhor';
  }, [sessionUserNick, currentUser, customization.userName]);

  // Assistant Brain instance
  const brain = useMemo(() => {
    return new JarvisBrain(customization.assistantName, effectiveUserName);
  }, [customization.assistantName, effectiveUserName]);

  // Save persistent state
  useEffect(() => {
    localStorage.setItem('jarvis_customization', JSON.stringify(customization));
  }, [customization]);

  useEffect(() => {
    localStorage.setItem('jarvis_providers', JSON.stringify(providerConfig));
  }, [providerConfig]);

  useEffect(() => {
    localStorage.setItem('jarvis_memories', JSON.stringify(memories));
  }, [memories]);

  // Log append helper
  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [...prev.slice(-150), newEntry]);
  };

  // Hardware telemetry simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((m) => ({
        cpu: Math.min(100, Math.max(8, m.cpu + (Math.random() - 0.49) * 6)),
        mem: Math.min(95, Math.max(30, m.mem + (Math.random() - 0.5) * 1.5)),
        net: Math.max(0.2, m.net + (Math.random() - 0.5) * 0.8),
        gpu: Math.min(99, Math.max(12, m.gpu + (Math.random() - 0.48) * 8)),
        tmp: Math.min(88, Math.max(38, m.tmp + (Math.random() - 0.5) * 0.8)),
        fps: 60,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Proactive Morning Briefing on first startup
  const briefedRef = useRef(false);
  useEffect(() => {
    if (customization.proactiveBriefingEnabled && !briefedRef.current) {
      briefedRef.current = true;
      const t = setTimeout(() => {
        handleUserCommand('Executar relatório matinal');
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [customization.proactiveBriefingEnabled]);

  // Speech handler
  const speakResponse = (text: string, onDone?: () => void) => {
    setStatus('SPEAKING');
    setStatusText('VOCALIZING RESPONSE');

    speechEngine.speak(
      text,
      activeVoiceId,
      () => {
        setStatus('IDLE');
        setStatusText('SISTEMAS EM PRONTIDÃO');
        setSpeechLevel(0);
        onDone?.();
      },
      (visemeLvl) => {
        setSpeechLevel(visemeLvl);
      }
    );
  };

  // User command dispatcher
  const handleUserCommand = async (rawText: string) => {
    if (!rawText.trim()) return;

    // Add user log
    addLog({
      source: 'USER',
      text: rawText,
    });

    setStatus('THINKING');
    setStatusText('PROCESSANDO DIRETIVA // AI STUDIO PT-BR');

    // Measure latency
    const startT = performance.now();

    // Check for Wake word triggers
    if (rawText.toLowerCase().includes('hey jarvis') || rawText.toLowerCase().includes('acordar') || rawText.toLowerCase().includes('wake up')) {
      const resp = await brain.processQueryAsync('acordar', memories, metrics);
      setLatencyMs(Math.round(performance.now() - startT));
      addLog({
        source: 'JARVIS',
        text: resp.spokenText,
      });
      speakResponse(resp.spokenText);
      return;
    }

    const resp = await brain.processQueryAsync(rawText, memories, metrics);
    const latency = Math.round(performance.now() - startT);
    setLatencyMs(latency);

    // Instant acknowledgment if slow task
    if (resp.acknowledgment) {
      addLog({
        source: 'JARVIS',
        text: resp.acknowledgment,
      });
      speakResponse(resp.acknowledgment, () => {
        finishExecution(resp);
      });
    } else {
      finishExecution(resp);
    }
  };

  const finishExecution = (resp: any) => {
    // Tool execution logging
    if (resp.toolName) {
      addLog({
        source: 'TOOL',
        text: `Executed [${resp.toolName}] -> outcome: ${resp.toolOutcome || 'done'}`,
        detail: resp.logDetail,
        status: resp.toolOutcome || 'done',
      });
    }

    // Dynamic Card on HUD
    if (resp.dynamicContent) {
      setDynamicContent(resp.dynamicContent);
    }

    // Memory commit
    if (resp.memoryUpdate) {
      const newEntry: MemoryEntry = {
        id: `mem-${Date.now()}`,
        category: resp.memoryUpdate.category,
        key: resp.memoryUpdate.key,
        value: resp.memoryUpdate.value,
        updated: new Date().toISOString().split('T')[0],
      };
      setMemories((prev) => [newEntry, ...prev]);
      addLog({
        source: 'SYSTEM',
        text: `Committed fact to memory [${resp.memoryUpdate.category}] -> ${resp.memoryUpdate.key}`,
        status: 'done',
      });
    }

    // Operator personalized nickname update without modifying Admin global settings
    if (resp.nicknameUpdate) {
      setSessionUserNick(resp.nicknameUpdate);
      localStorage.setItem('jarvis_session_nickname', resp.nicknameUpdate);
      addLog({
        source: 'SYSTEM',
        text: `Operador agora tratado como: "${resp.nicknameUpdate}" (padrão global do Admin mantido).`,
        status: 'done',
      });
    }

    // Modal action triggers (Camera Vision or Local Folder Search)
    if (resp.actionTrigger === 'open_camera') {
      setShowCameraModal(true);
    } else if (resp.actionTrigger === 'open_folder_search') {
      setShowFolderSearchModal(true);
    }

    // Safety gate confirmation
    if (resp.requiresConfirmation) {
      setConfirmReq({
        id: `conf-${Date.now()}`,
        title: resp.requiresConfirmation.title,
        actionName: resp.toolName || 'system_command',
        description: resp.requiresConfirmation.description,
        severity: 'danger',
        onConfirm: () => {
          setConfirmReq(null);
          addLog({
            source: 'SECURITY',
            text: `Manual human authorization granted for [${resp.requiresConfirmation.title}].`,
            status: 'done',
          });
          speakResponse('Authorization verified. Directive dispatched.');
        },
        onCancel: () => {
          setConfirmReq(null);
          addLog({
            source: 'SECURITY',
            text: `Action aborted by user [${resp.requiresConfirmation.title}].`,
            status: 'failed',
          });
          speakResponse('Action aborted, sir. Standing down.');
        },
      });
    }

    // Main spoken response
    if (resp.spokenText && !resp.acknowledgment) {
      addLog({
        source: 'JARVIS',
        text: resp.spokenText,
      });
      speakResponse(resp.spokenText);
    }
  };

  // Mic toggle
  const handleToggleMic = () => {
    if (isListening) {
      speechEngine.stopListening();
      audioManager.stopMic();
      setIsListening(false);
      setStatus('IDLE');
      setStatusText('STANDBY');
    } else {
      const ok = speechEngine.startListening((transcript, isFinal) => {
        if (isFinal) {
          handleUserCommand(transcript);
        }
      });
      if (ok) {
        audioManager.startMic(audioConfig.inputDeviceId);
        setIsListening(true);
        setStatus('LISTENING');
        setStatusText('ACOUSTIC STREAM ENGAGED // LISTENING');
      }
    }
  };

  // Global Keyboard shortcuts (Ctrl+Space for push to talk, Esc to close overlays)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveOverlay('none');
        setDynamicContent(null);
        return;
      }

      // Push to talk: Ctrl + Space
      if (customization.pushToTalkEnabled && e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        if (!isListening) {
          handleToggleMic();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (customization.pushToTalkEnabled && e.code === 'Space' && isListening) {
        handleToggleMic();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [customization.pushToTalkEnabled, isListening]);

  const handleOpenAdminProtected = (action: () => void) => {
    if (currentUser?.papel !== 'admin') {
      setRestrictionNotice(
        'Acesso Restrito: Somente o Administrador pode ajustar preferências gerais, vozes e o motor do sistema. Como operador, você pode pedir por voz ou texto: "JARVIS, me chame de [Seu Nome]" para personalizar seu tratamento na sessão, sem alterar o padrão geral do Administrador.'
      );
      setTimeout(() => setRestrictionNotice(null), 8000);
      return;
    }
    action();
  };

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{
        backgroundColor: palette.BG,
        color: palette.TEXT,
      }}
    >
      {/* ── TOP HEADER / HUD NAVIGATION ── */}
      <header
        className="w-full px-4 py-2.5 flex items-center justify-between border-b select-none backdrop-blur-lg z-30"
        style={{
          backgroundColor: `${palette.PANEL}f5`,
          borderColor: palette.BORDER,
        }}
      >
        {/* Left: Brand & Protocol */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full border-2 border-dashed animate-spin-slow"
              style={{ borderColor: palette.PRI }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full absolute"
              style={{ backgroundColor: palette.PRI }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-[0.25em] font-mono" style={{ color: palette.WHITE }}>
                {customization.assistantName}
              </span>
              <span
                className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold tracking-widest border"
                style={{
                  backgroundColor: palette.PRI_GHO,
                  borderColor: palette.BORDER_A,
                  color: palette.PRI,
                }}
              >
                MARK LVI
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground font-mono">
              AUTONOMOUS VOICE AI // ZERO SUBSCRIPTIONS
            </p>
          </div>
        </div>

        {/* Center: Live Assistant Status Pill */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-[10px] tracking-widest uppercase transition-all"
          style={{
            backgroundColor:
              status === 'SPEAKING'
                ? `${palette.GREEN}22`
                : status === 'LISTENING'
                ? `${palette.RED}22`
                : status === 'THINKING'
                ? `${palette.ACC}22`
                : palette.BAR_BG,
            borderColor:
              status === 'SPEAKING'
                ? palette.GREEN
                : status === 'LISTENING'
                ? palette.RED
                : status === 'THINKING'
                ? palette.ACC
                : palette.BORDER,
            color:
              status === 'SPEAKING'
                ? palette.GREEN
                : status === 'LISTENING'
                ? palette.RED
                : status === 'THINKING'
                ? palette.ACC
                : palette.TEXT_MED,
          }}
        >
          <div
            className={`w-2 h-2 rounded-full ${status !== 'IDLE' ? 'animate-ping' : ''}`}
            style={{
              backgroundColor:
                status === 'SPEAKING'
                  ? palette.GREEN
                  : status === 'LISTENING'
                  ? palette.RED
                  : status === 'THINKING'
                  ? palette.ACC
                  : palette.TEXT_DIM,
            }}
          />
          <span>{status}</span>
        </div>

        {/* Right: Quick Action Overlays Drawer Trigger Buttons */}
        <div className="flex items-center gap-1.5">
          {/* PWA Install Button */}
          <button
            onClick={handleInstallPwa}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: isInstalledPwa ? palette.GREEN : palette.PRI,
              backgroundColor: isInstalledPwa ? `${palette.GREEN}22` : `${palette.PRI}22`,
              color: isInstalledPwa ? palette.GREEN : palette.PRI,
            }}
            title={isInstalledPwa ? 'Aplicativo PWA Instalado' : 'Instalar JARVIS como PWA no Celular ou PC'}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[10px] font-bold">
              {isInstalledPwa ? 'PWA ATIVO' : 'INSTALAR PWA'}
            </span>
          </button>

          {/* Camera / Vision Button */}
          <button
            onClick={() => setShowCameraModal(true)}
            className="p-2 rounded-lg border hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
            style={{ borderColor: palette.PRI, backgroundColor: palette.PRI_GHO, color: palette.PRI }}
            title="Ativar Câmera e Visão Multimodal do JARVIS"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="hidden xl:inline text-[10px]">CÂMERA</span>
          </button>

          {/* Local Folder Search Button (Sem Python) */}
          <button
            onClick={() => setShowFolderSearchModal(true)}
            className="p-2 rounded-lg border hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
            style={{ borderColor: palette.BORDER, color: palette.TEXT }}
            title="Buscar em Pastas Locais do Computador (Sem Python)"
          >
            <FolderSearch className="w-4 h-4 text-emerald-400" />
            <span className="hidden xl:inline text-[10px]">PASTAS</span>
          </button>

          {/* Fish Audio Voice Button (Admin Protected) */}
          <button
            onClick={() => handleOpenAdminProtected(() => setShowAdminModal(true))}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all"
            style={{
              borderColor: palette.BORDER_A,
              backgroundColor: palette.PRI_GHO,
              color: palette.PRI,
            }}
            title="Voz Fish Audio Padrão Ativa: 82d13948027e4be69892dd3d0104e681. (Apenas Admin pode ajustar)"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold">VOZ FISH AUDIO</span>
          </button>

          {/* Engine & Providers (Admin Protected) */}
          <button
            onClick={() => handleOpenAdminProtected(() => setActiveOverlay('providers'))}
            className="p-2 rounded-lg border hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
            style={{ borderColor: palette.BORDER, color: palette.TEXT }}
            title="Engine & Provedores (Apenas Administrador pode ajustar)"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden xl:inline text-[10px]">ENGINE</span>
          </button>

          <button
            onClick={() => setActiveOverlay('memory')}
            className="p-2 rounded-lg border hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
            style={{ borderColor: palette.BORDER, color: palette.TEXT }}
            title="Recallable Memory Matrix"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden xl:inline text-[10px]">MEMORY</span>
          </button>

          <button
            onClick={() => setActiveOverlay('audio')}
            className="p-2 rounded-lg border hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
            style={{ borderColor: palette.BORDER, color: palette.TEXT }}
            title="Audio Hardware Routing & VU Meter Test"
          >
            <Headphones className="w-4 h-4" />
            <span className="hidden xl:inline text-[10px]">AUDIO</span>
          </button>

          <button
            onClick={() => setActiveOverlay('clipboard')}
            className="p-2 rounded-lg border hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
            style={{ borderColor: palette.BORDER, color: palette.TEXT }}
            title="Clipboard Intelligence (Translate, Summarize, Fix)"
          >
            <Clipboard className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveOverlay('remote')}
            className="p-2 rounded-lg border hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
            style={{ borderColor: palette.BORDER, color: palette.TEXT }}
            title="Mobile Remote QR Pairing"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Customize Preferences (Admin Protected) */}
          <button
            onClick={() => handleOpenAdminProtected(() => setActiveOverlay('customize'))}
            className="p-2 rounded-lg border hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono"
            style={{
              borderColor: palette.PRI,
              backgroundColor: palette.PRI_GHO,
              color: palette.PRI,
            }}
            title="Preferências Globais e Tema (Apenas Administrador)"
          >
            <PaletteIcon className="w-4 h-4" />
          </button>

          {/* User Auth / Admin Access Pill */}
          {currentUser ? (
            <div className="flex items-center gap-1 pl-1 border-l border-white/10">
              <button
                onClick={() => handleOpenAdminProtected(() => setShowAdminModal(true))}
                className="px-2.5 py-1.5 rounded-lg border font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                style={{
                  borderColor: currentUser.papel === 'admin' ? '#f59e0b' : palette.BORDER,
                  backgroundColor: currentUser.papel === 'admin' ? 'rgba(245, 158, 11, 0.15)' : palette.BAR_BG,
                  color: currentUser.papel === 'admin' ? '#fbbf24' : palette.WHITE,
                }}
                title={currentUser.papel === 'admin' ? "Abrir Painel Administrativo de Usuários e Vozes" : "Operador Autenticado"}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="max-w-[85px] truncate">{effectiveUserName}</span>
                <span className="text-[9px] opacity-75">({currentUser.papel})</span>
              </button>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setSessionUserNick('');
                  localStorage.removeItem('jarvis_current_user');
                  localStorage.removeItem('jarvis_session_nickname');
                }}
                className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 text-xs font-mono transition-colors"
                title="Encerrar Sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ml-1"
              style={{
                borderColor: palette.PRI,
                backgroundColor: palette.PRI_GHO,
                color: palette.PRI,
              }}
            >
              <User className="w-3.5 h-3.5" />
              <span>ENTRAR</span>
            </button>
          )}
        </div>
      </header>

      {/* ── METRICS TELEMETRY GAUGE BAR ── */}
      <MetricsBar
        metrics={metrics}
        palette={palette}
        engineName={providerConfig.engineMode === 'gemini' ? 'GEMINI 3.8 FLASH (AI STUDIO PT-BR)' : 'PIPELINE LOCAL'}
        latencyMs={latencyMs}
      />

      {/* ── MAIN HUD STAGE ── */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden relative pb-28 lg:pb-0">
        {/* Left/Center: HUD Holographic Avatar & Canvas Stage (Col 7) */}
        <section className="lg:col-span-7 min-h-[440px] lg:h-full flex flex-col relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="flex-1 relative flex items-center justify-center">
            {/* 3D Holographic Head & Arc Reactor HUD Canvas */}
            <HudCanvas
              status={status}
              palette={palette}
              speechLevel={speechLevel}
              micLevel={micLevel}
              statusText={statusText}
              assistantName={customization.assistantName}
            />

            {/* Dynamic Card Display beneath or in front of HUD */}
            {dynamicContent && (
              <div className="absolute inset-x-4 top-4 bottom-16 z-20 overflow-y-auto flex items-center justify-center pointer-events-auto">
                <DynamicCard
                  content={dynamicContent}
                  palette={palette}
                  onClose={() => setDynamicContent(null)}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right: Tactical Log Console (Col 5) */}
        <section className="lg:col-span-5 min-h-[340px] lg:h-full p-3 flex flex-col overflow-hidden bg-black/20">
          <LogWidget
            logs={logs}
            palette={palette}
            onClear={() => setLogs([])}
          />
        </section>
      </main>

      {/* ── FOOTER COMMAND BAR (FLUTUANTE E FIXO NO RODAPÉ EM DISPOSITIVOS MÓVEIS) ── */}
      <footer
        className="w-full px-2.5 sm:px-4 py-2 sm:py-3 border-t backdrop-blur-xl z-40 fixed bottom-0 left-0 right-0 lg:static transition-all shadow-[0_-10px_35px_rgba(0,0,0,0.92)] pb-[max(0.6rem,env(safe-area-inset-bottom))]"
        style={{
          backgroundColor: `${palette.PANEL}f8`,
          borderColor: palette.BORDER,
        }}
      >
        <ChatInput
          palette={palette}
          isListening={isListening}
          assistantName={customization.assistantName}
          onSend={handleUserCommand}
          onToggleMic={handleToggleMic}
          onWake={() => handleUserCommand('Hey Jarvis, report status.')}
          onAttachFile={(file) => {
            const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
            addLog({
              source: 'USER',
              text: `Ingested document: ${file.name} (${sizeStr})`,
            });
            handleUserCommand(`Process and analyze attached file ${file.name}`);
          }}
        />
      </footer>

      {/* ── CONFIRMATION GATE POPUP ── */}
      {confirmReq && (
        <ConfirmBanner request={confirmReq} palette={palette} />
      )}

      {/* ── MODAL OVERLAYS ── */}
      {activeOverlay === 'customize' && (
        <CustomizeOverlay
          customization={customization}
          palette={palette}
          onUpdate={(up) => setCustomization((prev) => ({ ...prev, ...up }))}
          onClose={() => setActiveOverlay('none')}
        />
      )}

      {activeOverlay === 'memory' && (
        <MemoryOverlay
          memories={memories}
          palette={palette}
          onAddMemory={(m) => {
            const entry: MemoryEntry = {
              ...m,
              id: `mem-${Date.now()}`,
              updated: new Date().toISOString().split('T')[0],
            };
            setMemories((prev) => [entry, ...prev]);
            addLog({
              source: 'SYSTEM',
              text: `Added memory item: [${m.category}] ${m.key}`,
              status: 'done',
            });
          }}
          onDeleteMemory={(id) => {
            setMemories((prev) => prev.filter((m) => m.id !== id));
            addLog({
              source: 'SYSTEM',
              text: `Pruned memory item: ID ${id}`,
              status: 'done',
            });
          }}
          onClose={() => setActiveOverlay('none')}
        />
      )}

      {activeOverlay === 'providers' && (
        <ProvidersOverlay
          config={providerConfig}
          palette={palette}
          onUpdate={(up) => setProviderConfig((prev) => ({ ...prev, ...up }))}
          onClose={() => setActiveOverlay('none')}
        />
      )}

      {activeOverlay === 'audio' && (
        <AudioDeviceOverlay
          config={audioConfig}
          palette={palette}
          onUpdate={(up) => setAudioConfig((prev) => ({ ...prev, ...up }))}
          onClose={() => setActiveOverlay('none')}
        />
      )}

      {activeOverlay === 'remote' && (
        <RemoteKeyOverlay
          palette={palette}
          onClose={() => setActiveOverlay('none')}
        />
      )}

      {activeOverlay === 'clipboard' && (
        <ClipboardPanel
          palette={palette}
          onExecuteAction={(action, text) => {
            setActiveOverlay('none');
            handleUserCommand(`${action} the following text: "${text}"`);
          }}
          onClose={() => setActiveOverlay('none')}
        />
      )}

      {activeOverlay === 'file' && (
        <FileDropZone
          palette={palette}
          onFileLoaded={(file) => {
            addLog({
              source: 'USER',
              text: `Uploaded local file: ${file.name} (${file.size})`,
            });
            handleUserCommand(`Analyze and summarize file ${file.name}`);
          }}
          onClose={() => setActiveOverlay('none')}
        />
      )}

      {/* ── PAINEL DE LOGIN E CADASTRO ── */}
      {showAuthModal && (
        <AuthModal
          palette={palette}
          onLoginSuccess={(user, storage) => {
            setCurrentUser(user);
            localStorage.setItem('jarvis_current_user', JSON.stringify(user));
            addLog({
              source: 'SECURITY',
              text: `Operador autenticado: ${user.nome} (${user.papel}) via ${storage}.`,
              status: 'done',
            });
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* ── PAINEL ADMINISTRATIVO (CRUD USUÁRIOS E VOZES) ── */}
      {showAdminModal && (
        <AdminPanelOverlay
          palette={palette}
          currentUser={currentUser}
          activeVoiceId={activeVoiceId}
          onVoiceChanged={(newVoiceId) => {
            setActiveVoiceId(newVoiceId);
            localStorage.setItem('jarvis_active_voice_id', newVoiceId);
            addLog({
              source: 'SYSTEM',
              text: `Voz padrão alterada para: ${newVoiceId}`,
              status: 'done',
            });
          }}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {/* ── SENSORES ÓPTICOS & CÂMERA (GEMINI VISION) ── */}
      {showCameraModal && (
        <CameraVisionOverlay
          palette={palette}
          assistantName={customization.assistantName}
          userName={effectiveUserName}
          activeVoiceId={activeVoiceId}
          onAnalysisResult={(res) => {
            addLog({
              source: 'JARVIS',
              text: `Análise Óptica Concluída: ${res.slice(0, 80)}...`,
              detail: res,
              status: 'done',
            });
          }}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {/* ── BUSCA EM PASTAS LOCAIS (SEM PYTHON) ── */}
      {showFolderSearchModal && (
        <LocalFolderSearchModal
          palette={palette}
          onSelectFileForJarvis={(f) => {
            addLog({
              source: 'USER',
              text: `Arquivo local selecionado para análise: ${f.name} (${f.path})`,
            });
            handleUserCommand(`Analise detalhadamente o arquivo local "${f.name}". Conteúdo:\n${f.content ? f.content.slice(0, 3000) : 'Arquivo binário.'}`);
          }}
          onClose={() => setShowFolderSearchModal(false)}
        />
      )}

      {/* ── AVISO DE PREFERÊNCIAS RESTRITAS AO ADMINISTRADOR ── */}
      {restrictionNotice && (
        <div className="fixed top-16 right-4 z-50 max-w-md p-3.5 rounded-xl border border-amber-500/50 bg-amber-950/95 text-amber-200 text-xs font-mono shadow-2xl backdrop-blur-md flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-[11px] uppercase tracking-wider text-amber-300">
              ACESSO RESTRITO AO ADMINISTRADOR
            </div>
            <p className="text-[10px] leading-relaxed text-amber-100/90">{restrictionNotice}</p>
          </div>
          <button
            onClick={() => setRestrictionNotice(null)}
            className="p-1 rounded hover:bg-white/10 text-amber-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
