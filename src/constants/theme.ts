export interface Palette {
  BG: string;
  PANEL: string;
  PANEL2: string;
  BORDER: string;
  BORDER_B: string;
  BORDER_A: string;
  PRI: string;
  PRI_DIM: string;
  PRI_GHO: string;
  ACC: string;
  ACC2: string;
  GREEN: string;
  GREEN_D: string;
  RED: string;
  TEXT: string;
  TEXT_DIM: string;
  TEXT_MED: string;
  WHITE: string;
  BAR_BG: string;
}

export const DEFAULT_PALETTE: Palette = {
  BG: "#00060a",
  PANEL: "#010d14",
  PANEL2: "#010f18",
  BORDER: "#0d3347",
  BORDER_B: "#1a5c7a",
  BORDER_A: "#0f4060",
  PRI: "#00d4ff",
  PRI_DIM: "#007a99",
  PRI_GHO: "#001f2e",
  ACC: "#ff6b00",
  ACC2: "#ffcc00",
  GREEN: "#00ff88",
  GREEN_D: "#00aa55",
  RED: "#ff3355",
  TEXT: "#8ffcff",
  TEXT_DIM: "#3a8a9a",
  TEXT_MED: "#5ab8cc",
  WHITE: "#d8f8ff",
  BAR_BG: "#011520",
};

export const PRESET_THEMES = [
  { name: 'Stark Arc Cyan', hex: '#00d4ff' },
  { name: 'Mark LVI Gold', hex: '#ffb300' },
  { name: 'S.H.I.E.L.D. Emerald', hex: '#00e676' },
  { name: 'War Machine Ruby', hex: '#ff1744' },
  { name: 'Wakanda Royal Violet', hex: '#a855f7' },
  { name: 'Stealth Monolith', hex: '#94a3b8' },
];

export function hexToHsv(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, v];
}

export function hsvToHex(h: number, s: number, v: number): string {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  const toHex = (n: number) => {
    const val = Math.round(n * 255);
    return val.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function deriveThemePalette(accentHex: string): Palette {
  const [baseH] = hexToHsv(DEFAULT_PALETTE.PRI);
  const [accH, accS] = hexToHsv(accentHex);
  const dh = accH - baseH;
  const isGrey = accS < 0.08;

  const linkedKeys: (keyof Palette)[] = [
    'BG', 'PANEL', 'PANEL2', 'BORDER', 'BORDER_B', 'BORDER_A',
    'PRI', 'PRI_DIM', 'PRI_GHO', 'TEXT', 'TEXT_DIM', 'TEXT_MED',
    'WHITE', 'BAR_BG'
  ];

  const result: Palette = { ...DEFAULT_PALETTE };

  for (const k of linkedKeys) {
    const origHex = DEFAULT_PALETTE[k];
    let [h, s, v] = hexToHsv(origHex);
    if (isGrey) s *= 0.15;
    const newH = (h + dh + 1.0) % 1.0;
    result[k] = hsvToHex(newH, s, v);
  }

  result.PRI = accentHex;
  return result;
}
