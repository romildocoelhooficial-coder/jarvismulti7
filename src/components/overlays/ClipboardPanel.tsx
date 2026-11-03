import React, { useState } from 'react';
import { X, Clipboard, Languages, FileText, Code2, Wrench, Check } from 'lucide-react';
import { Palette } from '../../constants/theme';

interface ClipboardPanelProps {
  palette: Palette;
  onExecuteAction: (action: string, text: string) => void;
  onClose: () => void;
}

export const ClipboardPanel: React.FC<ClipboardPanelProps> = ({
  palette,
  onExecuteAction,
  onClose,
}) => {
  const [clipboardText, setClipboardText] = useState(
    'const calculateThrust = (mass, gravity) => mass * gravity * 1.42;'
  );

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setClipboardText(text);
      }
    } catch (_) {
      // Browser permissions fallback
    }
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
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: palette.BORDER }}>
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5" style={{ color: palette.PRI }} />
            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: palette.WHITE }}>
                CLIPBOARD INTELLIGENCE
              </h3>
              <p className="text-[10px] text-muted-foreground">Instant analysis, translation, code refactoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground font-mono">Captured Buffer:</span>
              <button
                onClick={handlePasteFromClipboard}
                className="text-[10px] text-cyan-400 hover:underline font-mono"
              >
                Read Live OS Clipboard
              </button>
            </div>
            <textarea
              value={clipboardText}
              onChange={(e) => setClipboardText(e.target.value)}
              rows={4}
              className="w-full p-2.5 rounded-lg border bg-black/60 font-mono text-xs outline-none"
              style={{ borderColor: palette.BORDER, color: palette.WHITE }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onExecuteAction('Translate', clipboardText)}
              className="p-3 rounded-xl border bg-black/40 hover:bg-white/10 flex items-center gap-2 transition-all text-left"
              style={{ borderColor: palette.BORDER }}
            >
              <Languages className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <div>
                <div className="font-bold" style={{ color: palette.WHITE }}>Translate</div>
                <div className="text-[10px] text-muted-foreground">Auto-detect to target</div>
              </div>
            </button>

            <button
              onClick={() => onExecuteAction('Summarize', clipboardText)}
              className="p-3 rounded-xl border bg-black/40 hover:bg-white/10 flex items-center gap-2 transition-all text-left"
              style={{ borderColor: palette.BORDER }}
            >
              <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold" style={{ color: palette.WHITE }}>Summarize</div>
                <div className="text-[10px] text-muted-foreground">Key bullet takeaways</div>
              </div>
            </button>

            <button
              onClick={() => onExecuteAction('Explain', clipboardText)}
              className="p-3 rounded-xl border bg-black/40 hover:bg-white/10 flex items-center gap-2 transition-all text-left"
              style={{ borderColor: palette.BORDER }}
            >
              <Code2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="font-bold" style={{ color: palette.WHITE }}>Explain Logic</div>
                <div className="text-[10px] text-muted-foreground">Detailed walkthrough</div>
              </div>
            </button>

            <button
              onClick={() => onExecuteAction('Fix', clipboardText)}
              className="p-3 rounded-xl border bg-black/40 hover:bg-white/10 flex items-center gap-2 transition-all text-left"
              style={{ borderColor: palette.BORDER }}
            >
              <Wrench className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div>
                <div className="font-bold" style={{ color: palette.WHITE }}>Fix & Optimize</div>
                <div className="text-[10px] text-muted-foreground">Correct syntax & bugs</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
