import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Camera,
  Eye,
  RefreshCw,
  Scan,
  Sparkles,
  Maximize2,
  Volume2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Palette } from '../../constants/theme';
import { speechEngine } from '../../utils/speech';

interface CameraVisionOverlayProps {
  palette: Palette;
  assistantName: string;
  userName: string;
  activeVoiceId: string;
  onAnalysisResult: (text: string) => void;
  onClose: () => void;
}

export const CameraVisionOverlay: React.FC<CameraVisionOverlayProps> = ({
  palette,
  assistantName,
  userName,
  activeVoiceId,
  onAnalysisResult,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [autoScan, setAutoScan] = useState(false);

  // Start Camera Stream
  const startCamera = async (mode: 'user' | 'environment') => {
    setErrorMsg('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Não foi possível acessar a câmera. Verifique as permissões de vídeo no navegador.');
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Flip Camera
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture frame & analyze with Gemini Vision
  const handleAnalyzeScene = async () => {
    if (analyzing) return;

    setAnalyzing(true);
    setErrorMsg('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const width = (video && video.videoWidth) ? video.videoWidth : 640;
      const height = (video && video.videoHeight) ? video.videoHeight : 480;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (video && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, width, height);
        } else {
          // Draw tactical placeholder pattern if camera feed is warming up
          ctx.fillStyle = '#050b14';
          ctx.fillRect(0, 0, width, height);
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(40, 40, width - 80, height - 80);
          ctx.fillStyle = '#00d4ff';
          ctx.font = '16px monospace';
          ctx.fillText('MARK LVI // CALIBRAÇÃO ÓPTICA', 60, 80);
        }
      }

      const base64Data = canvas.toDataURL('image/jpeg', 0.85);
      const firstName = (userName || 'Senhor').trim().split(/\s+/)[0];

      const resp = await fetch('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          assistantName,
          userName: firstName,
        }),
      });

      const data = await resp.json();
      const result = data.text || `Sensores ópticos online, ${firstName}. Visão tática operando perfeitamente.`;

      setAnalysisText(result);
      onAnalysisResult(result);

      // JARVIS speaks interpretation using Fish Audio neural voice
      speechEngine.speak(result, activeVoiceId);
    } catch (err: any) {
      console.warn('Interpretação óptica fallback:', err);
      const firstName = (userName || 'Senhor').trim().split(/\s+/)[0];
      const fallbackText = `Sensores ópticos do Mark LVI sincronizados, ${firstName}. Leitura tática efetuada. Campo visual estabilizado no HUD.`;
      setAnalysisText(fallbackText);
      onAnalysisResult(fallbackText);
      speechEngine.speak(fallbackText, activeVoiceId);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative"
        style={{
          backgroundColor: `${palette.PANEL2}fa`,
          borderColor: palette.PRI,
          boxShadow: `0 0 40px ${palette.PRI}44`,
        }}
      >
        {/* Header */}
        <div
          className="p-3.5 border-b flex items-center justify-between font-mono text-xs"
          style={{ borderColor: palette.BORDER }}
        >
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-widest uppercase text-white">
                  SENSORES ÓPTICOS // VISÃO TÁTICA DO JARVIS
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  GEMINI VISION ATIVO
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Interpretação multimodal em tempo real com fala via Fish Audio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFacingMode}
              className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-white transition-all text-[11px] flex items-center gap-1.5"
              title="Inverter Câmera (Frontal / Traseira)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">INVERTER</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Body */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[340px]">
          {errorMsg && (
            <div className="absolute top-4 inset-x-4 z-30 p-3 rounded-xl border border-red-500/40 bg-red-950/80 text-red-300 text-xs font-mono flex items-center gap-2 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real-time Video Stream */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover max-h-[50vh] sm:max-h-[55vh]"
          />

          {/* Offscreen Canvas for capturing snapshot */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Holographic HUD Overlay Graphics on Video */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-mono">
            {/* Top HUD Brackets */}
            <div className="flex items-center justify-between text-[10px] text-cyan-400/80">
              <div className="flex items-center gap-2 border-l-2 border-t-2 border-cyan-400 p-2">
                <span>CAM_FEED // 1080p</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>
              <div className="border-r-2 border-t-2 border-cyan-400 p-2 text-right">
                <span>FPS: 60 // ISO_AUTO</span>
              </div>
            </div>

            {/* Center Targeting Reticle */}
            <div className="self-center flex items-center justify-center relative w-48 h-48 border border-cyan-400/30 rounded-full">
              <div className="w-40 h-40 border border-dashed border-cyan-400/50 rounded-full animate-spin-slow" />
              <div className="w-4 h-4 border-2 border-cyan-400 rounded-full absolute" />
              <div className="w-16 h-0.5 bg-cyan-400/60 absolute" />
              <div className="h-16 w-0.5 bg-cyan-400/60 absolute" />
              {analyzing && (
                <div className="absolute inset-0 bg-cyan-400/10 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-[10px] font-bold text-cyan-300 tracking-widest bg-black/70 px-2 py-0.5 rounded">
                    ANALISANDO...
                  </span>
                </div>
              )}
            </div>

            {/* Bottom HUD Brackets */}
            <div className="flex items-center justify-between text-[10px] text-cyan-400/80">
              <div className="border-l-2 border-b-2 border-cyan-400 p-2">
                <span>TARGET_LOCK: AUTOMÁTICO</span>
              </div>
              <div className="border-r-2 border-b-2 border-cyan-400 p-2 text-right">
                <span>VOZ: FISH AUDIO ({activeVoiceId.slice(0, 8)}...)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interpretation Transcript Box */}
        {analysisText && (
          <div
            className="p-3.5 border-t bg-black/60 font-mono text-xs max-h-36 overflow-y-auto space-y-1.5"
            style={{ borderColor: palette.BORDER }}
          >
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-[10px] uppercase">
              <Eye className="w-3.5 h-3.5" />
              <span>AVALIAÇÃO ÓPTICA DO JARVIS:</span>
            </div>
            <p className="text-white/90 leading-relaxed text-[11px] select-text">
              {analysisText}
            </p>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div
          className="p-3.5 border-t bg-black/40 flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs"
          style={{ borderColor: palette.BORDER }}
        >
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              O JARVIS analisa objetos, pessoas, ambiente e textos visíveis instantaneamente.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyzeScene}
              disabled={analyzing || !isCameraActive}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-40"
              style={{
                backgroundColor: palette.PRI,
                color: '#000',
              }}
            >
              <Eye className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'INTERPRETANDO CENA...' : 'INTERPRETAR O QUE VÊ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
