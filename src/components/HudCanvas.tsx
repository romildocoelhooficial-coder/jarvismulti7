import React, { useEffect, useRef, useState } from 'react';
import { AssistantStatus } from '../types';
import { Palette } from '../constants/theme';

interface HudCanvasProps {
  status: AssistantStatus;
  palette: Palette;
  speechLevel: number;
  micLevel: number;
  statusText: string;
  assistantName: string;
}

export const HudCanvas: React.FC<HudCanvasProps> = ({
  status,
  palette,
  speechLevel,
  micLevel,
  statusText,
  assistantName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Animation state refs for canvas graphics
  const stateRef = useRef({
    ringRot1: 0,
    ringRot2: 0,
    radarAngle: 0,
    pulseEnergy: 0,
    lastTime: performance.now(),
    particles: Array.from({ length: 32 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.001,
      vy: -0.0005 - Math.random() * 0.0015,
      size: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.6,
    })),
  });

  // Track mouse coordinates for subtle 3D holographic tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: nx * 12, y: ny * 12 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (now: number) => {
      const st = stateRef.current;
      const dt = Math.min((now - st.lastTime) / 1000, 0.1);
      st.lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Rotation speeds based on state
      const speedMult = status === 'THINKING' ? 2.5 : status === 'SPEAKING' ? 1.6 : 0.6;
      st.ringRot1 += dt * speedMult;
      st.ringRot2 -= dt * (speedMult * 0.7);
      st.radarAngle = (st.radarAngle + dt * 1.8) % (Math.PI * 2);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;

      // Dynamic Audio Energy
      const audioEnergy = status === 'SPEAKING' ? speechLevel : status === 'LISTENING' ? micLevel : 0.05;
      st.pulseEnergy += (audioEnergy - st.pulseEnergy) * (dt * 10);

      // 1. Dynamic Particles floating upward like energy dust
      st.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy * (1 + st.pulseEnergy * 2);
        if (p.y < 0) p.y = 1;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;

        ctx.fillStyle = status === 'SPEAKING'
          ? `rgba(0, 255, 136, ${p.alpha * 0.7})`
          : status === 'THINKING'
          ? `rgba(255, 170, 0, ${p.alpha * 0.7})`
          : `rgba(0, 212, 255, ${p.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size * (1 + st.pulseEnergy), 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Tactical Rotating Rings & Reticles
      ctx.save();
      ctx.translate(cx, cy);

      // Outer dashed Ring 1
      ctx.save();
      ctx.rotate(st.ringRot1);
      ctx.strokeStyle = status === 'THINKING' ? `${palette.ACC}55` : `${palette.PRI}40`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 14, 20, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Compass tick marks
      ctx.setLineDash([]);
      for (let i = 0; i < 36; i++) {
        const ang = (i / 36) * Math.PI * 2;
        const len = i % 9 === 0 ? 14 : i % 3 === 0 ? 8 : 4;
        const r1 = radius - len;
        const r2 = radius;
        ctx.strokeStyle = i % 9 === 0 ? palette.PRI : `${palette.PRI}44`;
        ctx.lineWidth = i % 9 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
        ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.restore();

      // Inner Counter-rotating Segment Ring 2
      ctx.save();
      ctx.rotate(st.ringRot2);
      ctx.strokeStyle = status === 'SPEAKING' ? `${palette.GREEN}55` : `${palette.PRI}50`;
      ctx.lineWidth = 2;
      ctx.setLineDash([30, 18, 6, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Radar Sweep Effect
      ctx.save();
      const sweepGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, radius * 0.95);
      sweepGradient.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
      sweepGradient.addColorStop(0.8, 'rgba(0, 212, 255, 0.04)');
      sweepGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius * 0.95, st.radarAngle, st.radarAngle + 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore(); // restore translated center

      // 3. Audio spectrum bars on bottom left and bottom right
      const barCount = 14;
      const barW = 3;
      const barGap = 4;
      const maxBarH = 38;

      // Left Audio Spectrum (Mic)
      for (let i = 0; i < barCount; i++) {
        const factor = Math.sin((i / barCount) * Math.PI) * (micLevel || 0.15);
        const bh = Math.max(4, factor * maxBarH + (Math.sin(now * 0.008 + i) * 6));
        const bx = 28 + i * (barW + barGap);
        const by = h - 35 - bh;
        ctx.fillStyle = micLevel > 0.1 ? palette.PRI : `${palette.PRI}44`;
        ctx.fillRect(bx, by, barW, bh);
      }

      // Right Audio Spectrum (Speech)
      for (let i = 0; i < barCount; i++) {
        const factor = Math.sin((i / barCount) * Math.PI) * (speechLevel || 0.15);
        const bh = Math.max(4, factor * maxBarH + (Math.sin(now * 0.01 + i) * 7));
        const bx = w - 28 - (barCount * (barW + barGap)) + i * (barW + barGap);
        const by = h - 35 - bh;
        ctx.fillStyle = speechLevel > 0.1 ? palette.GREEN : `${palette.PRI}44`;
        ctx.fillRect(bx, by, barW, bh);
      }

      // 4. Status telemetry readout text
      ctx.textAlign = 'center';
      ctx.font = '700 11px Orbitron, sans-serif';
      ctx.fillStyle = status === 'THINKING' ? palette.ACC : status === 'SPEAKING' ? palette.GREEN : palette.PRI;
      ctx.letterSpacing = '3px';
      ctx.fillText(`${assistantName.toUpperCase()} // STATUS: ${status}`, cx, h - 36);

      if (statusText) {
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.fillStyle = palette.WHITE;
        ctx.letterSpacing = '1px';
        ctx.fillText(statusText, cx, h - 18);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [status, palette, speechLevel, micLevel, statusText, assistantName]);

  // Dynamic intensity factors for CSS holographic illumination
  const glowIntensity = status === 'SPEAKING'
    ? 0.75 + speechLevel * 0.5
    : status === 'LISTENING'
    ? 0.7 + micLevel * 0.5
    : status === 'THINKING'
    ? 0.85
    : 0.5;

  const glowColor = status === 'SPEAKING'
    ? 'rgba(0, 255, 136, '
    : status === 'THINKING'
    ? 'rgba(255, 170, 0, '
    : 'rgba(0, 212, 255, ';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-gradient-to-b from-[#00060a]/90 via-[#010d14]/70 to-[#00060a]/95"
      style={{ perspective: '1000px' }}
    >
      {/* ── HOLOGRAMA PRINCIPAL: HOMEM DE FERRO JARVIS (VIVO & DINÂMICO) ── */}
      <div
        className="relative z-10 flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0px)`,
        }}
      >
        {/* Hologram Living Wrapper with Breathing Float & Pulse */}
        <div
          className="relative max-w-[95%] max-h-[80vh] flex items-center justify-center animate-holo-float"
          style={{
            filter: `drop-shadow(0 0 ${20 + glowIntensity * 25}px ${glowColor}${glowIntensity * 0.6})) drop-shadow(0 0 ${40 + glowIntensity * 30}px ${glowColor}${glowIntensity * 0.3}))`,
          }}
        >
          {/* Main Iron Man Jarvis Artwork */}
          <img
            src="/assets/aistudio/homem-de-ferro-jarvis-desktop-68rms2vasiun945j_c12e7db5.jpg"
            alt="Iron Man JARVIS Hologram"
            className="w-auto h-auto max-h-[75vh] max-w-full object-contain rounded-2xl opacity-95 transition-all duration-300 pointer-events-none select-none"
            style={{
              mixBlendMode: 'screen',
              filter: `contrast(115%) brightness(${100 + glowIntensity * 25}%) saturate(120%)`,
            }}
          />

          {/* ── NÚCLEO ARC REACTOR PULSANTE (CHEST GLOW) ── */}
          <div
            className="absolute z-20 pointer-events-none rounded-full animate-arc-glow"
            style={{
              top: '67%',
              left: '50%',
              width: '90px',
              height: '90px',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, #ffffff 0%, #00d4ff 40%, rgba(0, 212, 255, 0.4) 70%, transparent 85%)`,
              boxShadow: `0 0 ${30 + speechLevel * 50}px #00d4ff, inset 0 0 20px #ffffff`,
              opacity: 0.85 + (status === 'SPEAKING' ? speechLevel * 0.4 : micLevel * 0.3),
            }}
          />

          {/* Shockwave Rings radiating from Arc Reactor during speech */}
          {(status === 'SPEAKING' || speechLevel > 0.1) && (
            <div
              className="absolute z-10 pointer-events-none rounded-full border border-cyan-400/80 animate-ping"
              style={{
                top: '67%',
                left: '50%',
                width: '110px',
                height: '110px',
                transform: 'translate(-50%, -50%)',
                animationDuration: '1.2s',
              }}
            />
          )}

          {/* ── VISORES ÓPTICOS (EYE GLOW) ── */}
          <div
            className="absolute z-20 pointer-events-none rounded-full"
            style={{
              top: '27.4%',
              left: '48.2%',
              width: '26px',
              height: '8px',
              transform: 'translate(-50%, -50%) rotate(-6deg)',
              background: '#ffffff',
              boxShadow: `0 0 16px #00d4ff, 0 0 32px #ffffff`,
              opacity: status === 'SLEEPING' ? 0.2 : 0.95 + speechLevel * 0.2,
            }}
          />
          <div
            className="absolute z-20 pointer-events-none rounded-full"
            style={{
              top: '27.4%',
              left: '52.4%',
              width: '26px',
              height: '8px',
              transform: 'translate(-50%, -50%) rotate(6deg)',
              background: '#ffffff',
              boxShadow: `0 0 16px #00d4ff, 0 0 32px #ffffff`,
              opacity: status === 'SLEEPING' ? 0.2 : 0.95 + speechLevel * 0.2,
            }}
          />

          {/* ── VARREDURA DE LASER HOLOGRÁFICO (SCANLINE BEAM) ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div
              className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00d4ff] animate-holo-scan"
            />
          </div>

          {/* Micro HUD Target Corner Brackets around Hologram */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400/80" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400/80" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400/80" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400/80" />
        </div>
      </div>

      {/* ── CANVAS RETICLES, SENSORS & TELEMETRY OVERLAY ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-20 block pointer-events-none"
      />

      {/* Cybernetic Scanlines Screen Grid Texture */}
      <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-35" />
    </div>
  );
};
