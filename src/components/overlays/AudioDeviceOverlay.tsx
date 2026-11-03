import React, { useState, useEffect } from 'react';
import { X, Headphones, Mic, Volume2, Play, CheckCircle } from 'lucide-react';
import { AudioDeviceConfig } from '../../types';
import { Palette } from '../../constants/theme';
import { audioManager } from '../../utils/audio';

interface AudioDeviceOverlayProps {
  config: AudioDeviceConfig;
  palette: Palette;
  onUpdate: (updated: Partial<AudioDeviceConfig>) => void;
  onClose: () => void;
}

export const AudioDeviceOverlay: React.FC<AudioDeviceOverlayProps> = ({
  config,
  palette,
  onUpdate,
  onClose,
}) => {
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micPeak, setMicPeak] = useState(0);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setInputs(devices.filter(d => d.kind === 'audioinput'));
        setOutputs(devices.filter(d => d.kind === 'audiooutput'));
      } catch (err) {
        console.warn('Cannot enumerate devices:', err);
      }
    };
    fetchDevices();
  }, []);

  // Mic test loop
  useEffect(() => {
    let animId: number;
    if (isTestingMic) {
      audioManager.startMic(config.inputDeviceId);
      const poll = () => {
        const lvl = audioManager.getMicLevel();
        setMicPeak(lvl);
        animId = requestAnimationFrame(poll);
      };
      animId = requestAnimationFrame(poll);
    } else {
      setMicPeak(0);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isTestingMic, config.inputDeviceId]);

  const handleTestSpeaker = () => {
    audioManager.playTestTone(480, 0.6);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: `${palette.PANEL2}f8`,
          borderColor: palette.BORDER_B,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: palette.BORDER }}>
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5" style={{ color: palette.PRI }} />
            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: palette.WHITE }}>
                AUDIO HARDWARE ROUTING
              </h3>
              <p className="text-[10px] text-muted-foreground">Select and verify physical microphone & speakers</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsTestingMic(false);
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Microphone */}
          <div className="p-4 rounded-xl border bg-black/40 space-y-3" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase flex items-center gap-1.5" style={{ color: palette.WHITE }}>
                <Mic className="w-4 h-4" style={{ color: palette.PRI }} />
                <span>Microphone (Input Device)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsTestingMic(!isTestingMic)}
                className="px-2.5 py-1 rounded text-[10px] font-bold uppercase border hover:bg-white/10 transition-all flex items-center gap-1"
                style={{
                  borderColor: isTestingMic ? palette.RED : palette.BORDER,
                  color: isTestingMic ? palette.RED : palette.PRI,
                }}
              >
                <Play className="w-2.5 h-2.5" /> {isTestingMic ? 'STOP TEST' : 'TEST MIC'}
              </button>
            </div>

            <select
              value={config.inputDeviceId}
              onChange={(e) => onUpdate({ inputDeviceId: e.target.value })}
              className="w-full p-2.5 rounded-lg border bg-black/60 font-mono text-xs outline-none"
              style={{ borderColor: palette.BORDER, color: palette.WHITE }}
            >
              <option value="">Default System Microphone</option>
              {inputs.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Microphone ${i + 1}`}
                </option>
              ))}
            </select>

            {/* Live Mic Meter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span>Signal Peak Meter:</span>
                <span>{(micPeak * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/60 border overflow-hidden p-0.5" style={{ borderColor: palette.BORDER }}>
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.min(100, micPeak * 100)}%`,
                    backgroundColor: micPeak > 0.8 ? palette.RED : micPeak > 0.4 ? palette.GREEN : palette.PRI,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Speakers */}
          <div className="p-4 rounded-xl border bg-black/40 space-y-3" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase flex items-center gap-1.5" style={{ color: palette.WHITE }}>
                <Volume2 className="w-4 h-4" style={{ color: palette.PRI }} />
                <span>Speakers (Output Device)</span>
              </span>
              <button
                type="button"
                onClick={handleTestSpeaker}
                className="px-2.5 py-1 rounded text-[10px] font-bold uppercase border hover:bg-white/10 transition-all flex items-center gap-1"
                style={{ borderColor: palette.BORDER, color: palette.PRI }}
              >
                <Play className="w-2.5 h-2.5" /> TEST TONE
              </button>
            </div>

            <select
              value={config.outputDeviceId}
              onChange={(e) => onUpdate({ outputDeviceId: e.target.value })}
              className="w-full p-2.5 rounded-lg border bg-black/60 font-mono text-xs outline-none"
              style={{ borderColor: palette.BORDER, color: palette.WHITE }}
            >
              <option value="">Default System Speakers</option>
              {outputs.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Speaker Output ${i + 1}`}
                </option>
              ))}
            </select>

            {/* Dedicated Output Volume Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span>Output Volume Gain:</span>
                <span>{(config.outputVolume * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.outputVolume}
                onChange={(e) => onUpdate({ outputVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end" style={{ borderColor: palette.BORDER }}>
          <button
            onClick={() => {
              setIsTestingMic(false);
              onClose();
            }}
            className="px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider"
            style={{ backgroundColor: palette.PRI, color: '#000' }}
          >
            Confirm Devices
          </button>
        </div>
      </div>
    </div>
  );
};
