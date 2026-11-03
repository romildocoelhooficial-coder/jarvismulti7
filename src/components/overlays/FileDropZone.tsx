import React, { useState } from 'react';
import { UploadCloud, File, X, Check } from 'lucide-react';
import { Palette } from '../../constants/theme';

interface FileDropZoneProps {
  palette: Palette;
  onFileLoaded: (file: { name: string; size: string; content: string }) => void;
  onClose: () => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  palette,
  onFileLoaded,
  onClose,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      onFileLoaded({
        name: file.name,
        size: sizeStr,
        content: text.slice(0, 4000),
      });
      onClose();
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: `${palette.PANEL2}f8`,
          borderColor: palette.BORDER_B,
        }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: palette.BORDER }}>
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5" style={{ color: palette.PRI }} />
            <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: palette.WHITE }}>
              FILE INGESTION // PROCESSOR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
              isDragging ? 'border-cyan-400 bg-cyan-950/20' : 'border-white/15 bg-black/30 hover:border-white/30'
            }`}
          >
            <UploadCloud className="w-12 h-12 mb-3" style={{ color: palette.PRI }} />
            <span className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: palette.WHITE }}>
              Drop Document, Code, or Log File Here
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Supports .txt, .py, .ts, .json, .md, .csv (Max 500 MB)
            </span>
            <input type="file" onChange={handleFileInput} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
