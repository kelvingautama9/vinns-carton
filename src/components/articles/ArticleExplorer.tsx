import React, { useState, useMemo } from 'react';
import articlesData from '../../data/data_artikel.json';
import { Article } from '../../types';
import { 
  Search, 
  Database, 
  FolderOpen, 
  ChevronLeft, 
  ArrowUpDown, 
  Copy, 
  Check, 
  Calculator, 
  Terminal, 
  Weight, 
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ArticleExplorerProps {
  onUseArticle: (article: Article, targetTab: 'price' | 'god-mode' | 'tonnage') => void;
}

export function ArticleExplorer({ onUseArticle }: ArticleExplorerProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof Article>('nama_artikel');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const data: Article[] = articlesData as Article[];

  // Extract all unique group categories (e.g., G003, G004, etc.)
  const groups = useMemo(() => {
    const groupSet = new Set<string>();
    data.forEach((item) => {
      const parts = item.nama_artikel.split('-');
      if (parts.length > 1) {
        groupSet.add(parts[1]);
      }
    });
    return Array.from(groupSet).sort();
  }, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let result = data;
    if (selectedGroup) {
      result = result.filter((item) => item.nama_artikel.includes(`-${selectedGroup}-`));
    }
    if (filter.trim()) {
      const q = filter.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.nama_artikel.toLowerCase().includes(q) ||
          item.ukuran.toLowerCase().includes(q) ||
          item.substance.toLowerCase().includes(q) ||
          item.flute.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, selectedGroup, filter]);

  // Sorted dataset
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey] || '';
      const valB = b[sortKey] || '';
      const comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortOrder]);

  const toggleSort = (key: keyof Article) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleCopy = (item: Article) => {
    const text = `${item.nama_artikel} | Ukuran: ${item.ukuran} mm | Substance: ${item.substance} | Flute: ${item.flute}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Category selector grid when no group is selected */}
      {!selectedGroup ? (
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white font-mono">PILIH KATEGORI DATASET</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                Pilih grup kode artikel untuk membuka database spesifikasi ({data.length} total artikel)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Option to show All Articles */}
            <button
              onClick={() => setSelectedGroup('ALL')}
              className="p-6 rounded-2xl glass-panel border border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 transition-all flex flex-col items-center gap-2 group text-center"
            >
              <FolderOpen className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-black text-white font-mono tracking-wider">SEMUA</span>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-mono">
                {data.length} ARTIKEL
              </span>
            </button>

            {groups.map((grp) => {
              const count = data.filter((d) => d.nama_artikel.includes(`-${grp}-`)).length;
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-amber-400 hover:bg-white/5 transition-all flex flex-col items-center gap-2 group text-center"
                >
                  <FolderOpen className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-black text-white font-mono tracking-wider">{grp}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                    {count} ARTIKEL
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedGroup(null);
                  setFilter('');
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Kategori
              </button>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-muted-foreground uppercase">Grup Aktif:</span>
                <span className="px-3 py-1 rounded-lg bg-amber-500 text-black font-black font-mono">
                  {selectedGroup === 'ALL' ? 'SEMUA ARTIKEL' : selectedGroup}
                </span>
                <span className="text-muted-foreground">({sortedData.length} records)</span>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari ID, Ukuran, Substance..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bloomberg-input rounded-xl font-mono"
              />
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono divide-y divide-white/10">
                <thead className="bg-black/50 text-muted-foreground font-bold tracking-wider uppercase">
                  <tr>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-amber-400" onClick={() => toggleSort('nama_artikel')}>
                      <div className="flex items-center gap-1.5">
                        <span>Artikel ID</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-amber-400" onClick={() => toggleSort('ukuran')}>
                      <div className="flex items-center gap-1.5">
                        <span>Ukuran (PxL mm)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-amber-400" onClick={() => toggleSort('substance')}>
                      <div className="flex items-center gap-1.5">
                        <span>Substance</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-amber-400 text-center" onClick={() => toggleSort('flute')}>
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Flute</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right">Aksi Cepat</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {sortedData.length > 0 ? (
                    sortedData.map((item) => (
                      <tr key={item.id} className="hover:bg-amber-500/5 transition-colors group">
                        <td className="py-3 px-4 font-bold text-white tracking-tight">
                          {item.nama_artikel}
                        </td>
                        <td className="py-3 px-4 text-amber-300">
                          {item.ukuran}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {item.substance}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold border border-white/10 text-[10px]">
                            {item.flute}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopy(item)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5 transition-colors"
                              title="Salin Spesifikasi"
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onUseArticle(item, 'price')}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20 text-[10px] font-bold transition-colors"
                              title="Kirim ke Price Calculator"
                            >
                              <Calculator className="w-3 h-3" />
                              <span>Price</span>
                            </button>
                            <button
                              onClick={() => onUseArticle(item, 'god-mode')}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[10px] font-bold transition-colors"
                              title="Kirim ke God Mode Terminal"
                            >
                              <Terminal className="w-3 h-3 text-amber-400" />
                              <span>God Mode</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        <div className="space-y-2">
                          <Search className="w-8 h-8 mx-auto opacity-30" />
                          <p className="font-bold text-sm">Tidak ada artikel yang cocok dengan pencarian "{filter}"</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
