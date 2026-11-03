import React, { useState } from 'react';
import { X, Smartphone, QrCode, ShieldCheck, RefreshCw, Key, AlertTriangle } from 'lucide-react';
import { Palette } from '../../constants/theme';

interface RemoteKeyOverlayProps {
  palette: Palette;
  onClose: () => void;
}

export const RemoteKeyOverlay: React.FC<RemoteKeyOverlayProps> = ({
  palette,
  onClose,
}) => {
  const [pairingCode, setPairingCode] = useState('7K9P-4X2M');
  const [isRevoked, setIsRevoked] = useState(false);

  const handleRegenerate = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) res += '-';
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    setPairingCode(res);
    setIsRevoked(false);
  };

  const handleRevoke = () => {
    setIsRevoked(true);
    handleRegenerate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: `${palette.PANEL2}f8`,
          borderColor: palette.BORDER_B,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: palette.BORDER }}>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" style={{ color: palette.PRI }} />
            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: palette.WHITE }}>
                MOBILE REMOTE DASHBOARD
              </h3>
              <p className="text-[10px] text-muted-foreground">Pair smartphone on local network to control JARVIS</p>
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
        <div className="p-6 text-center space-y-5 text-xs">
          {/* Security Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-emerald-950/40 border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AES-256-GCM // PBKDF2 (200,000 Rounds)</span>
          </div>

          {/* QR Code Simulation Graphic */}
          <div className="mx-auto w-48 h-48 p-3 rounded-2xl bg-white flex flex-col items-center justify-center shadow-lg relative border-4 border-cyan-400/30">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Corner markers */}
              <rect x="5" y="5" width="25" height="25" fill="#000" />
              <rect x="8" y="8" width="19" height="19" fill="#fff" />
              <rect x="12" y="12" width="11" height="11" fill="#000" />

              <rect x="70" y="5" width="25" height="25" fill="#000" />
              <rect x="73" y="8" width="19" height="19" fill="#fff" />
              <rect x="77" y="12" width="11" height="11" fill="#000" />

              <rect x="5" y="70" width="25" height="25" fill="#000" />
              <rect x="8" y="73" width="19" height="19" fill="#fff" />
              <rect x="12" y="77" width="11" height="11" fill="#000" />

              {/* Data modules */}
              <rect x="36" y="10" width="6" height="6" fill="#000" />
              <rect x="48" y="10" width="6" height="6" fill="#000" />
              <rect x="36" y="24" width="6" height="6" fill="#000" />
              <rect x="54" y="24" width="6" height="6" fill="#000" />
              <rect x="12" y="40" width="6" height="6" fill="#000" />
              <rect x="24" y="40" width="6" height="6" fill="#000" />
              <rect x="42" y="40" width="6" height="6" fill="#000" />
              <rect x="58" y="40" width="6" height="6" fill="#000" />
              <rect x="76" y="40" width="6" height="6" fill="#000" />
              <rect x="42" y="55" width="16" height="6" fill="#000" />
              <rect x="68" y="65" width="6" height="16" fill="#000" />
              <rect x="40" y="78" width="8" height="8" fill="#000" />
              <rect x="54" y="84" width="12" height="6" fill="#000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-2 py-0.5 rounded bg-black text-[#00d4ff] text-[9px] font-bold font-mono tracking-widest border border-cyan-400">
                MK-56
              </div>
            </div>
          </div>

          {/* Pairing Key */}
          <div className="p-3 rounded-xl border bg-black/50 space-y-1 font-mono" style={{ borderColor: palette.BORDER }}>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">
              8-Character Pairing Key
            </span>
            <div className="text-xl font-bold tracking-widest" style={{ color: palette.PRI }}>
              {pairingCode}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRegenerate}
              className="px-3 py-2 rounded-lg border text-muted-foreground hover:text-white flex items-center gap-1.5 transition-all text-[11px] font-mono"
              style={{ borderColor: palette.BORDER }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Key</span>
            </button>

            <button
              onClick={handleRevoke}
              className="px-3 py-2 rounded-lg border border-red-500/40 bg-red-950/20 text-red-400 hover:bg-red-950/40 flex items-center gap-1.5 transition-all text-[11px] font-mono"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Revoke All Devices</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
