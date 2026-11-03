import React from 'react';
import { X, ExternalLink, CloudRain, Plane, Globe, Film, FileText, CheckCircle2 } from 'lucide-react';
import { DynamicContent } from '../types';
import { Palette } from '../constants/theme';

interface DynamicCardProps {
  content: DynamicContent;
  palette: Palette;
  onClose: () => void;
}

export const DynamicCard: React.FC<DynamicCardProps> = ({
  content,
  palette,
  onClose,
}) => {
  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-xl p-4 my-2 border shadow-2xl backdrop-blur-lg relative animate-in fade-in zoom-in-95 duration-200"
      style={{
        backgroundColor: `${palette.PANEL2}f0`,
        borderColor: palette.BORDER_B,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 15px ${palette.PRI}22`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2 mb-3" style={{ borderColor: palette.BORDER }}>
        <div className="flex items-center gap-2">
          {content.type === 'weather' && <CloudRain className="w-4 h-4 text-sky-400" />}
          {content.type === 'flight' && <Plane className="w-4 h-4 text-amber-400" />}
          {content.type === 'search' && <Globe className="w-4 h-4" style={{ color: palette.PRI }} />}
          {content.type === 'video' && <Film className="w-4 h-4 text-rose-400" />}
          {content.type === 'file' && <FileText className="w-4 h-4 text-emerald-400" />}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: palette.WHITE }}>
              {content.title}
            </h4>
            {content.subtitle && (
              <p className="text-[10px] text-muted-foreground">{content.subtitle}</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: palette.TEXT_DIM }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content Based on Type */}
      <div className="text-xs space-y-3">
        {content.type === 'weather' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded border bg-black/30" style={{ borderColor: palette.BORDER }}>
              <div className="text-2xl font-bold font-mono" style={{ color: palette.PRI }}>
                {content.data.temp || '22°C'}
              </div>
              <div className="text-[10px] text-muted-foreground">{content.data.condition || 'Partly Cloudy'}</div>
            </div>
            <div className="p-2.5 rounded border bg-black/30" style={{ borderColor: palette.BORDER }}>
              <div className="text-sm font-semibold font-mono" style={{ color: palette.WHITE }}>
                {content.data.humidity || '45%'}
              </div>
              <div className="text-[10px] text-muted-foreground">Humidity</div>
            </div>
            <div className="p-2.5 rounded border bg-black/30" style={{ borderColor: palette.BORDER }}>
              <div className="text-sm font-semibold font-mono" style={{ color: palette.WHITE }}>
                {content.data.wind || '14 km/h'}
              </div>
              <div className="text-[10px] text-muted-foreground">Wind (NW)</div>
            </div>
            <div className="p-2.5 rounded border bg-black/30" style={{ borderColor: palette.BORDER }}>
              <div className="text-sm font-semibold font-mono" style={{ color: palette.GREEN }}>
                Good (28)
              </div>
              <div className="text-[10px] text-muted-foreground">Air Quality</div>
            </div>
          </div>
        )}

        {content.type === 'flight' && (
          <div className="p-3 rounded border bg-black/30 space-y-2" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm tracking-widest" style={{ color: palette.PRI }}>
                {content.data.flightNo || 'STARK-742'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                ON TIME
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <div>
                <div className="text-lg font-bold" style={{ color: palette.WHITE }}>{content.data.origin || 'SFO'}</div>
                <div className="text-[10px] text-muted-foreground">08:30 AM PST</div>
              </div>
              <div className="text-center px-4">
                <Plane className="w-4 h-4 mx-auto text-muted-foreground" />
                <div className="text-[9px] text-muted-foreground">5h 15m non-stop</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: palette.WHITE }}>{content.data.dest || 'JFK'}</div>
                <div className="text-[10px] text-muted-foreground">04:45 PM EST</div>
              </div>
            </div>
          </div>
        )}

        {content.type === 'video' && (
          <div className="relative aspect-video rounded overflow-hidden border bg-black" style={{ borderColor: palette.BORDER }}>
            <iframe
              className="w-full h-full"
              src={content.data.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'}
              title="HUD Video Display"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {content.type === 'search' && (
          <div className="space-y-2">
            <p className="leading-relaxed" style={{ color: palette.TEXT }}>
              {content.data.summary || content.data.text}
            </p>
            {content.data.sources && content.data.sources.length > 0 && (
              <div className="pt-2 border-t flex flex-wrap gap-2" style={{ borderColor: palette.BORDER }}>
                {content.data.sources.map((s: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border bg-black/40 text-muted-foreground"
                    style={{ borderColor: palette.BORDER_A }}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {content.type === 'file' && (
          <div className="p-3 rounded border bg-black/40 space-y-2 font-mono text-[11px]" style={{ borderColor: palette.BORDER }}>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Size: {content.data.size || '12.4 KB'}</span>
              <span>Lines: {content.data.lines || '284'}</span>
            </div>
            <pre className="p-2 rounded bg-black/60 overflow-x-auto text-emerald-300">
              {content.data.preview || '// File content analyzed and indexed\nexport const status = "READY";'}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2" style={{ borderColor: palette.BORDER }}>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Grounded Result
        </span>
        <span>{content.timestamp}</span>
      </div>
    </div>
  );
};
