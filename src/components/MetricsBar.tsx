import React from 'react';
import { Cpu, HardDrive, Activity, Wifi, Thermometer, ShieldCheck } from 'lucide-react';
import { SysMetrics } from '../types';
import { Palette } from '../constants/theme';

interface MetricsBarProps {
  metrics: SysMetrics;
  palette: Palette;
  engineName: string;
  latencyMs: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  metrics,
  palette,
  engineName,
  latencyMs,
}) => {
  return (
    <div
      className="w-full px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b select-none backdrop-blur-md"
      style={{
        backgroundColor: `${palette.PANEL}ee`,
        borderColor: palette.BORDER,
      }}
    >
      {/* Left Brand / Engine Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: palette.GREEN }}
          />
          <div
            className="w-2 h-2 rounded-full -ml-3.5"
            style={{ backgroundColor: palette.GREEN }}
          />
          <span
            className="font-bold tracking-widest text-[11px] uppercase"
            style={{ color: palette.PRI }}
          >
            MK-LVI
          </span>
        </div>

        <div
          className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider flex items-center gap-1.5 border"
          style={{
            backgroundColor: palette.PRI_GHO,
            borderColor: palette.BORDER_A,
            color: palette.TEXT,
          }}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{engineName}</span>
          <span className="opacity-40">|</span>
          <span style={{ color: palette.WHITE }}>{latencyMs}ms</span>
        </div>
      </div>

      {/* Hardware Telemetry Counters */}
      <div className="flex items-center gap-4 text-[11px] font-mono">
        {/* CPU */}
        <div className="flex items-center gap-1.5" title="CPU Utilization">
          <Cpu className="w-3.5 h-3.5" style={{ color: palette.PRI_DIM }} />
          <span className="text-muted-foreground text-[10px]">CPU</span>
          <span className="font-bold" style={{ color: metrics.cpu > 80 ? palette.RED : palette.WHITE }}>
            {metrics.cpu.toFixed(0)}%
          </span>
          <div className="w-12 h-1.5 rounded-full overflow-hidden bg-black/40 border border-white/5">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${metrics.cpu}%`,
                backgroundColor: metrics.cpu > 80 ? palette.RED : palette.PRI,
              }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="flex items-center gap-1.5" title="RAM Utilization">
          <HardDrive className="w-3.5 h-3.5" style={{ color: palette.PRI_DIM }} />
          <span className="text-muted-foreground text-[10px]">RAM</span>
          <span className="font-bold" style={{ color: metrics.mem > 85 ? palette.RED : palette.WHITE }}>
            {metrics.mem.toFixed(0)}%
          </span>
          <div className="w-12 h-1.5 rounded-full overflow-hidden bg-black/40 border border-white/5">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${metrics.mem}%`,
                backgroundColor: metrics.mem > 85 ? palette.RED : palette.PRI,
              }}
            />
          </div>
        </div>

        {/* GPU */}
        <div className="flex items-center gap-1.5" title="GPU Utilization">
          <Activity className="w-3.5 h-3.5" style={{ color: palette.PRI_DIM }} />
          <span className="text-muted-foreground text-[10px]">GPU</span>
          <span className="font-bold" style={{ color: metrics.gpu > 80 ? palette.RED : palette.WHITE }}>
            {metrics.gpu.toFixed(0)}%
          </span>
          <div className="w-12 h-1.5 rounded-full overflow-hidden bg-black/40 border border-white/5">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${metrics.gpu}%`,
                backgroundColor: metrics.gpu > 80 ? palette.RED : palette.PRI,
              }}
            />
          </div>
        </div>

        {/* NET */}
        <div className="flex items-center gap-1.5" title="Network Throughput">
          <Wifi className="w-3.5 h-3.5" style={{ color: palette.PRI_DIM }} />
          <span className="text-muted-foreground text-[10px]">NET</span>
          <span className="font-bold" style={{ color: palette.WHITE }}>
            {metrics.net.toFixed(1)} MB/s
          </span>
        </div>

        {/* TEMP */}
        <div className="flex items-center gap-1.5" title="Core Temperature">
          <Thermometer
            className="w-3.5 h-3.5"
            style={{ color: metrics.tmp > 75 ? palette.RED : palette.PRI_DIM }}
          />
          <span className="text-muted-foreground text-[10px]">TEMP</span>
          <span
            className="font-bold"
            style={{ color: metrics.tmp > 80 ? palette.RED : palette.WHITE }}
          >
            {metrics.tmp.toFixed(0)}°C
          </span>
        </div>
      </div>
    </div>
  );
};
