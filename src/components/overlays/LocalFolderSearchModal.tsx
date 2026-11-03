import React, { useState, useRef } from 'react';
import {
  X,
  FolderSearch,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  Sparkles,
  CheckCircle,
  Eye,
  File,
} from 'lucide-react';
import { Palette } from '../../constants/theme';

export interface IndexedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  content?: string;
}

interface LocalFolderSearchModalProps {
  palette: Palette;
  onSelectFileForJarvis: (file: IndexedFile) => void;
  onClose: () => void;
}

export const LocalFolderSearchModal: React.FC<LocalFolderSearchModalProps> = ({
  palette,
  onSelectFileForJarvis,
  onClose,
}) => {
  const [folderName, setFolderName] = useState<string>('');
  const [files, setFiles] = useState<IndexedFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInContent, setSearchInContent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<IndexedFile | null>(null);

  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Modern File System Access API or Directory input fallback
  const handleSelectDirectory = async () => {
    // 1. Try File System Access API
    if ('showDirectoryPicker' in window) {
      try {
        setLoading(true);
        const dirHandle = await (window as any).showDirectoryPicker();
        setFolderName(dirHandle.name);
        const collected: IndexedFile[] = [];

        const readEntries = async (handle: any, currentPath = '') => {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              const ext = file.name.split('.').pop()?.toLowerCase() || '';
              let textContent = '';

              // Read text files up to 2MB
              if (
                file.size < 2 * 1024 * 1024 &&
                ['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'php', 'html', 'css', 'md', 'txt', 'sql', 'csv', 'env', 'log'].includes(ext)
              ) {
                try {
                  textContent = await file.text();
                } catch (_) {}
              }

              collected.push({
                name: file.name,
                path: `${currentPath}/${file.name}`,
                size: file.size,
                type: file.type || ext,
                content: textContent,
              });
            } else if (entry.kind === 'directory') {
              // Avoid node_modules or .git for fast indexing
              if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
                await readEntries(entry, `${currentPath}/${entry.name}`);
              }
            }
          }
        };

        await readEntries(dirHandle, dirHandle.name);
        setFiles(collected);
        setLoading(false);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setLoading(false);
          return;
        }
      }
    }

    // Fallback: directory file input
    folderInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setLoading(true);
    const collected: IndexedFile[] = [];
    const firstPath = fileList[0].webkitRelativePath || '';
    const rootName = firstPath.split('/')[0] || 'Pasta Selecionada';
    setFolderName(rootName);

    Array.from(fileList).forEach((file: any) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const reader = new FileReader();

      // Read text files
      if (
        file.size < 2 * 1024 * 1024 &&
        ['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'php', 'html', 'css', 'md', 'txt', 'sql', 'csv', 'env', 'log'].includes(ext)
      ) {
        reader.onload = (event) => {
          const content = (event.target?.result as string) || '';
          collected.push({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            size: file.size,
            type: file.type || ext,
            content,
          });
          if (collected.length === fileList.length) {
            setFiles([...collected]);
            setLoading(false);
          }
        };
        reader.readAsText(file);
      } else {
        collected.push({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          size: file.size,
          type: file.type || ext,
        });
        if (collected.length === fileList.length) {
          setFiles([...collected]);
          setLoading(false);
        }
      }
    });
  };

  // Filter files
  const filteredFiles = files.filter((f) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = f.name.toLowerCase().includes(term) || f.path.toLowerCase().includes(term);
    const contentMatch = searchInContent && f.content && f.content.toLowerCase().includes(term);
    return nameMatch || contentMatch;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          backgroundColor: `${palette.PANEL2}fa`,
          borderColor: palette.BORDER_B,
          boxShadow: `0 0 35px ${palette.PRI}33`,
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between font-mono text-xs"
          style={{ borderColor: palette.BORDER }}
        >
          <div className="flex items-center gap-2.5">
            <FolderSearch className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-widest uppercase text-white">
                  BUSCA EM PASTAS LOCAIS // ARQUIVOS & CÓDIGO
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  SEM NECESSIDADE DE PYTHON
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Indexação instantânea no navegador via File System API e leitura de conteúdo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div
          className="p-4 border-b bg-black/40 flex flex-wrap items-center justify-between gap-3 font-mono text-xs"
          style={{ borderColor: palette.BORDER }}
        >
          {/* Pick Directory Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectDirectory}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow"
              style={{ backgroundColor: palette.PRI, color: '#000' }}
            >
              <FolderOpen className="w-4 h-4" />
              <span>{loading ? 'INDEXANDO ARQUIVOS...' : 'SELECIONAR PASTA NO PC'}</span>
            </button>

            {folderName && (
              <span className="text-xs text-cyan-300 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                📁 Pasta: <strong>{folderName}</strong> ({files.length} arquivos indexados)
              </span>
            )}

            {/* Hidden Input Fallback */}
            <input
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              ref={folderInputRef}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome de arquivo ou texto interno..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-black/50 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                style={{ borderColor: palette.BORDER }}
              />
            </div>
            <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchInContent}
                onChange={(e) => setSearchInContent(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>No conteúdo</span>
            </label>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden font-mono text-xs">
          {/* Files List (Col 7) */}
          <div className="md:col-span-7 border-r overflow-y-auto p-3 space-y-2 border-white/5 bg-black/20">
            {files.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground space-y-2">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold">Nenhuma pasta selecionada ainda.</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Clique em <strong>"SELECIONAR PASTA NO PC"</strong> para escolher qualquer pasta de documentos ou projeto. O JARVIS indexa e faz busca instantânea no navegador sem precisar de Python!
                </p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic text-xs">
                Nenhum arquivo encontrado para o termo "{searchTerm}".
              </div>
            ) : (
              filteredFiles.map((f, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedFile(f)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    selectedFile?.path === f.path
                      ? 'border-cyan-400 bg-cyan-950/30'
                      : 'border-white/5 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate text-xs">{f.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{f.path}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground font-mono">{formatSize(f.size)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFileForJarvis(f);
                        onClose();
                      }}
                      className="px-2 py-1 rounded border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-400 text-[10px] uppercase font-bold"
                      title="Enviar ao JARVIS para análise"
                    >
                      Analisar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview Panel (Col 5) */}
          <div className="md:col-span-5 p-4 flex flex-col justify-between overflow-hidden bg-black/40">
            {selectedFile ? (
              <div className="flex flex-col h-full space-y-3">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="font-bold text-white text-xs truncate">{selectedFile.name}</h4>
                  <span className="text-[10px] text-muted-foreground">{selectedFile.path}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 rounded-lg bg-black/70 border border-white/5 font-mono text-[10px] leading-relaxed text-cyan-300/90 whitespace-pre-wrap select-text">
                  {selectedFile.content || 'Arquivo binário ou pré-visualização não suportada como texto.'}
                </div>

                <button
                  onClick={() => {
                    onSelectFileForJarvis(selectedFile);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow"
                  style={{ backgroundColor: palette.PRI, color: '#000' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ANALISAR ESTE ARQUIVO COM O JARVIS</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground text-xs">
                Selecione um arquivo da lista para pré-visualizar seu código ou texto.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
