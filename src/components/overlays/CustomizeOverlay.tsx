import React from 'react';
import { X, Palette as PaletteIcon, User, Bot, Volume2, Mic, Sparkles } from 'lucide-react';
import { AssistantCustomization } from '../../types';
import { Palette, PRESET_THEMES } from '../../constants/theme';

interface CustomizeOverlayProps {
  customization: AssistantCustomization;
  palette: Palette;
  onUpdate: (updated: Partial<AssistantCustomization>) => void;
  onClose: () => void;
}

export const CustomizeOverlay: React.FC<CustomizeOverlayProps> = ({
  customization,
  palette,
  onUpdate,
  onClose,
}) => {
  const VOICES = [
    { id: 'Puck', desc: 'Crisp, articulate baritone' },
    { id: 'Charon', desc: 'Deep, calm authoritative' },
    { id: 'Kore', desc: 'Precise, clear soprano' },
    { id: 'Fenrir', desc: 'Direct, focused tenor' },
    { id: 'Aoede', desc: 'Melodic, natural alto' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: `${palette.PANEL2}f8`,
          borderColor: palette.BORDER_B,
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: palette.BORDER }}
        >
          <div className="flex items-center gap-2">
            <PaletteIcon className="w-5 h-5" style={{ color: palette.PRI }} />
            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: palette.WHITE }}>
                ASSISTANT CUSTOMIZATION // PROTOCOLS
              </h3>
              <p className="text-[10px] text-muted-foreground">Reconfigure identity, holographic HUD hue, and voice</p>
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
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Identity Names */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" style={{ color: palette.PRI }} /> 1. Identity & Call-Signs
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1 font-mono">Assistant Name</label>
                <input
                  type="text"
                  value={customization.assistantName}
                  onChange={(e) => onUpdate({ assistantName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border bg-black/40 font-mono text-xs outline-none"
                  style={{ borderColor: palette.BORDER, color: palette.WHITE }}
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1 font-mono">User Name / Call-Sign</label>
                <input
                  type="text"
                  value={customization.userName}
                  onChange={(e) => onUpdate({ userName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border bg-black/40 font-mono text-xs outline-none"
                  style={{ borderColor: palette.BORDER, color: palette.WHITE }}
                />
              </div>
            </div>
          </div>

          {/* HUD Hue Themes */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: palette.PRI }} /> 2. Holographic HUD Accent Hue
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_THEMES.map((theme) => {
                const isSelected = customization.accentColor.toLowerCase() === theme.hex.toLowerCase();
                return (
                  <button
                    key={theme.name}
                    onClick={() => onUpdate({ accentColor: theme.hex })}
                    className="p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all"
                    style={{
                      borderColor: isSelected ? theme.hex : palette.BORDER,
                      backgroundColor: isSelected ? `${theme.hex}18` : 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-white/20 shadow"
                      style={{ backgroundColor: theme.hex }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-[11px] truncate" style={{ color: palette.WHITE }}>
                        {theme.name}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground">{theme.hex}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Custom Hex input */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] text-muted-foreground font-mono">Custom Hex:</span>
              <input
                type="color"
                value={customization.accentColor}
                onChange={(e) => onUpdate({ accentColor: e.target.value })}
                className="w-8 h-8 rounded border bg-transparent cursor-pointer"
              />
              <span className="font-mono text-xs" style={{ color: palette.PRI }}>
                {customization.accentColor}
              </span>
            </div>
          </div>

          {/* Voice Personality */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" style={{ color: palette.PRI }} /> 3. Gemini Live Vocal Engine
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VOICES.map((v) => {
                const isSelected = customization.voiceName === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onUpdate({ voiceName: v.id })}
                    className="p-2.5 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: isSelected ? palette.PRI : palette.BORDER,
                      backgroundColor: isSelected ? palette.PRI_GHO : 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: isSelected ? palette.PRI : palette.WHITE }}>
                        {v.id}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold" style={{ backgroundColor: `${palette.GREEN}22`, color: palette.GREEN }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{v.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Behavior Switches */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" style={{ color: palette.PRI }} /> 4. Triggers & Proactivity
            </h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border bg-black/30 cursor-pointer" style={{ borderColor: palette.BORDER }}>
                <div>
                  <div className="font-semibold text-xs" style={{ color: palette.WHITE }}>"Hey Jarvis" Wake Word Detection</div>
                  <div className="text-[10px] text-muted-foreground">Listens in low-power idle mode and wakes when summoned</div>
                </div>
                <input
                  type="checkbox"
                  checked={customization.wakeWordEnabled}
                  onChange={(e) => onUpdate({ wakeWordEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border bg-black/30 cursor-pointer" style={{ borderColor: palette.BORDER }}>
                <div>
                  <div className="font-semibold text-xs" style={{ color: palette.WHITE }}>Push-to-Talk (Hold Ctrl+Space)</div>
                  <div className="text-[10px] text-muted-foreground">Mic remains closed until key combo is pressed</div>
                </div>
                <input
                  type="checkbox"
                  checked={customization.pushToTalkEnabled}
                  onChange={(e) => onUpdate({ pushToTalkEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border bg-black/30 cursor-pointer" style={{ borderColor: palette.BORDER }}>
                <div>
                  <div className="font-semibold text-xs" style={{ color: palette.WHITE }}>Autonomous Morning Briefing</div>
                  <div className="text-[10px] text-muted-foreground">Greets user, summarizes time, weather, and yesterday's session recap</div>
                </div>
                <input
                  type="checkbox"
                  checked={customization.proactiveBriefingEnabled}
                  onChange={(e) => onUpdate({ proactiveBriefingEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>
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
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
