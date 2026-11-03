import React, { useEffect, useState } from 'react';
import { AlertOctagon, Check, X } from 'lucide-react';
import { ConfirmationRequest } from '../../types';
import { Palette } from '../../constants/theme';

interface ConfirmBannerProps {
  request: ConfirmationRequest;
  palette: Palette;
}

export const ConfirmBanner: React.FC<ConfirmBannerProps> = ({
  request,
  palette,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          request.onCancel();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [request]);

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg p-4 animate-in slide-in-from-top-4 duration-200">
      <div
        className="rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3"
        style={{
          backgroundColor: '#0a0305f5',
          borderColor: palette.RED,
          boxShadow: `0 0 25px ${palette.RED}44`,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 flex-shrink-0 animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-widest text-red-400 font-mono">
                SECURITY CONFIRMATION GATE // {request.title}
              </h4>
              <span className="text-[10px] font-mono text-red-300 font-bold">
                {secondsLeft}s
              </span>
            </div>
            <p className="text-xs text-white/90 mt-1 leading-relaxed">
              {request.description}
            </p>
            <div className="text-[10px] text-red-300/70 font-mono mt-1">
              Irreversible action. AI is prohibited from confirming this directive autonomously.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-500/20">
          <button
            onClick={request.onCancel}
            className="px-4 py-1.5 rounded-lg border border-white/20 text-xs font-mono text-white/80 hover:bg-white/10 transition-colors"
          >
            Abort / Cancel
          </button>
          <button
            onClick={request.onConfirm}
            className="px-5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors shadow-lg shadow-red-900/50 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>AUTHORIZE ACTION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
