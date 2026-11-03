import React, { useState } from 'react';
import { X, Brain, Search, Plus, Trash2, Tag, Calendar, Database } from 'lucide-react';
import { MemoryEntry } from '../../types';
import { Palette } from '../../constants/theme';

interface MemoryOverlayProps {
  memories: MemoryEntry[];
  palette: Palette;
  onAddMemory: (entry: Omit<MemoryEntry, 'id' | 'updated'>) => void;
  onDeleteMemory: (id: string) => void;
  onClose: () => void;
}

export const MemoryOverlay: React.FC<MemoryOverlayProps> = ({
  memories,
  palette,
  onAddMemory,
  onDeleteMemory,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<MemoryEntry['category']>('preferences');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const CATEGORIES: MemoryEntry['category'][] = [
    'identity',
    'preferences',
    'projects',
    'relationships',
    'wishes',
    'notes',
  ];

  const filtered = memories.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.key.toLowerCase().includes(search.toLowerCase()) ||
      m.value.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalChars = memories.reduce((acc, m) => acc + m.key.length + m.value.length, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    onAddMemory({
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
    });
    setNewKey('');
    setNewValue('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: `${palette.PANEL2}f8`,
          borderColor: palette.BORDER_B,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: palette.BORDER }}>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" style={{ color: palette.PRI }} />
            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: palette.WHITE }}>
                RECALLABLE MEMORY MATRIX
              </h3>
              <p className="text-[10px] text-muted-foreground">Persistent cross-session knowledge & user personal facts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
              <Database className="w-3.5 h-3.5" style={{ color: palette.PRI }} />
              <span>Prompt Core: {totalChars} / 900 Chars</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-3 border-b flex flex-wrap items-center justify-between gap-3 bg-black/30" style={{ borderColor: palette.BORDER }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recallable facts or keys…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-black/40 text-xs font-mono outline-none"
              style={{ borderColor: palette.BORDER, color: palette.WHITE }}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-2.5 py-1.5 rounded-lg border uppercase font-bold transition-all"
              style={{
                backgroundColor: selectedCategory === 'all' ? palette.PRI_GHO : 'transparent',
                borderColor: selectedCategory === 'all' ? palette.PRI : palette.BORDER,
                color: selectedCategory === 'all' ? palette.PRI : palette.TEXT_MED,
              }}
            >
              ALL ({memories.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = memories.filter((m) => m.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-2.5 py-1.5 rounded-lg border uppercase font-bold transition-all"
                  style={{
                    backgroundColor: selectedCategory === cat ? palette.PRI_GHO : 'transparent',
                    borderColor: selectedCategory === cat ? palette.PRI : palette.BORDER,
                    color: selectedCategory === cat ? palette.PRI : palette.TEXT_MED,
                  }}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-lg border flex items-center gap-1 font-bold text-xs uppercase"
            style={{
              backgroundColor: palette.PRI,
              borderColor: palette.PRI,
              color: '#000',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Store Fact</span>
          </button>
        </div>

        {/* Add Memory Modal Form */}
        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="p-4 border-b bg-black/60 space-y-3 animate-in fade-in"
            style={{ borderColor: palette.BORDER }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1 font-mono">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 rounded-lg border bg-black/60 text-xs font-mono outline-none"
                  style={{ borderColor: palette.BORDER, color: palette.WHITE }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-muted-foreground mb-1 font-mono">Fact Key / Subject</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. favorite_coffee, sister_name, main_project"
                  className="w-full p-2 rounded-lg border bg-black/60 text-xs font-mono outline-none"
                  style={{ borderColor: palette.BORDER, color: palette.WHITE }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1 font-mono">Fact Detail / Context</label>
              <textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. Prefers iced pour-over with light roast Ethiopian beans."
                rows={2}
                className="w-full p-2 rounded-lg border bg-black/60 text-xs font-mono outline-none"
                style={{ borderColor: palette.BORDER, color: palette.WHITE }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg border text-muted-foreground hover:text-white text-xs"
                style={{ borderColor: palette.BORDER }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg font-bold text-xs uppercase"
                style={{ backgroundColor: palette.PRI, color: '#000' }}
              >
                Commit to Memory
              </button>
            </div>
          </form>
        )}

        {/* Memories List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic font-mono">
              No matching memories stored in this category.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border bg-black/30 flex items-start justify-between gap-3 group hover:border-cyan-500/40 transition-all"
                style={{ borderColor: palette.BORDER }}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider"
                      style={{ backgroundColor: palette.PRI_GHO, color: palette.PRI }}
                    >
                      {item.category}
                    </span>
                    <span className="font-bold font-mono text-sm" style={{ color: palette.WHITE }}>
                      {item.key}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: palette.TEXT }}>
                    {item.value}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono pt-1">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>Learned: {item.updated}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMemory(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                  title="Forget this fact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
