import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, ArrowDownCircle, Check, AlertTriangle, AlertOctagon } from 'lucide-react';
import { LogEntry } from '../types';
import { Palette } from '../constants/theme';

interface LogWidgetProps {
  logs: LogEntry[];
  palette: Palette;
  onClear: () => void;
}

export const LogWidget: React.FC<LogWidgetProps> = ({
  logs,
  palette,
  onClear,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className="flex flex-col h-full border rounded-xl overflow-hidden backdrop-blur-md"
      style={{
        backgroundColor: `${palette.PANEL}dd`,
        borderColor: palette.BORDER,
      }}
    >
      {/* Terminal Header */}
      <div
        className="px-3 py-2 border-b flex items-center justify-between text-xs select-none"
        style={{
          borderColor: palette.BORDER,
          backgroundColor: palette.BAR_BG,
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" style={{ color: palette.PRI }} />
          <span className="font-bold tracking-wider text-[11px] uppercase" style={{ color: palette.WHITE }}>
            TACTICAL LOG // CONSOLE
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-muted-foreground font-mono">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title="Clear Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-[11px] leading-relaxed select-text"
      >
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground italic text-xs">
            Mark LVI system initialized. Ready for command.
          </div>
        ) : (
          logs.map((entry) => {
            const isUser = entry.source === 'USER';
            const isJarvis = entry.source === 'JARVIS';
            const isTool = entry.source === 'TOOL';
            const isSecurity = entry.source === 'SECURITY';

            return (
              <div
                key={entry.id}
                className="p-2 rounded border bg-black/25 flex flex-col gap-1 transition-all"
                style={{
                  borderColor: isUser
                    ? `${palette.PRI}44`
                    : isTool
                    ? `${palette.BORDER_A}`
                    : isSecurity
                    ? `${palette.RED}44`
                    : palette.BORDER,
                }}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-bold px-1.5 py-0.2 rounded uppercase tracking-wider text-[9px]"
                      style={{
                        backgroundColor: isUser
                          ? palette.PRI_GHO
                          : isJarvis
                          ? `${palette.GREEN}22`
                          : isSecurity
                          ? `${palette.RED}22`
                          : 'rgba(255,255,255,0.06)',
                        color: isUser
                          ? palette.PRI
                          : isJarvis
                          ? palette.GREEN
                          : isSecurity
                          ? palette.RED
                          : palette.TEXT_MED,
                      }}
                    >
                      {entry.source}
                    </span>
                    <span className="text-muted-foreground">{entry.timestamp}</span>
                  </div>

                  {entry.status && (
                    <span
                      className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest"
                      style={{
                        color:
                          entry.status === 'done'
                            ? palette.GREEN
                            : entry.status === 'unverified'
                            ? palette.ACC2
                            : palette.RED,
                      }}
                    >
                      {entry.status === 'done' ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : entry.status === 'unverified' ? (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      ) : (
                        <AlertOctagon className="w-2.5 h-2.5" />
                      )}
                      {entry.status}
                    </span>
                  )}
                </div>

                <div
                  className="font-sans text-xs break-words whitespace-pre-wrap"
                  style={{
                    color: isUser
                      ? palette.WHITE
                      : isJarvis
                      ? palette.TEXT
                      : palette.TEXT_MED,
                  }}
                >
                  {entry.text}
                </div>

                {entry.detail && (
                  <div className="text-[10px] text-muted-foreground font-mono bg-black/40 p-1.5 rounded mt-0.5 border border-white/5">
                    {entry.detail}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
