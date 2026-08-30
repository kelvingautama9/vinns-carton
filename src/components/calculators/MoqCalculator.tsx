import React, { useState, useMemo, useCallback } from 'react';
import { MoqRow } from '../../types';
import { calculateMOQ, hitungOut } from '../../lib/calculations';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ClipboardPaste, 
  Download, 
  Package, 
  Layers,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { BulkPasteModal } from '../modals/BulkPasteModal';

interface MoqCalculatorProps {
  initialRows?: MoqRow[];
}

export function MoqCalculator({ initialRows }: MoqCalculatorProps) {
  const [rows, setRows] = useState<MoqRow[]>(() => {
    if (initialRows && initialRows.length > 0) return initialRows;
    return [
      { id: `moq_${Date.now()}_1`, panjang: 1000, lebar: 800 },
      { id: `moq_${Date.now()}_2`, panjang: 1200, lebar: 600 },
    ];
  });

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);

  const updateRow = useCallback((index: number, field: keyof MoqRow, value: any) => {
    setRows((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `moq_${Date.now()}_${prev.length + 1}`,
        panjang: 1000,
        lebar: 800,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const computedRows = useMemo(() => {
    return rows.map((row) => {
      const p = Number(row.panjang) || 0;
      const l = Number(row.lebar) || 0;
      const result = calculateMOQ({ panjang: p, lebar: l });

      // Corrugator trim waste calculation
      const rollMax = 2480;
      const usedWidth = result.out * l;
      const trimWasteMm = result.out > 0 ? rollMax - usedWidth : 0;
      const trimWastePercent = result.out > 0 ? (trimWasteMm / rollMax) * 100 : 0;

      return {
        ...row,
        moq: result.moq,
        out: result.out,
        isManufacturable: result.isManufacturable,
        usedWidth,
        trimWasteMm,
        trimWastePercent: Number(trimWastePercent.toFixed(1)),
      };
    });
  }, [rows]);

  const copyRow = (index: number) => {
    const r = computedRows[index];
    if (!r) return;
    const text = `Ukuran: ${r.panjang}x${r.lebar} mm | Out: ${r.out} | MOQ: ${r.moq.toLocaleString()} pcs`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    const lines: string[] = [];
    lines.push(`=== REKAP ESTIMASI MOQ & OUT CORRUGATOR ===`);
    lines.push(`Panjang Run Min: 500 Meter (500.000 mm) | Lebar Roll Max: 2.480 mm`);
    lines.push(``);

    computedRows.forEach((r, idx) => {
      lines.push(`${idx + 1}. Ukuran: ${r.panjang} x ${r.lebar} mm`);
      lines.push(`   Out Potong : ${r.out} Out (Lebar terpakai: ${r.usedWidth} mm)`);
      lines.push(`   Trim Waste : ${r.trimWasteMm} mm (${r.trimWastePercent}%)`);
      lines.push(`   Est. MOQ   : ${r.isManufacturable ? `${r.moq.toLocaleString()} pcs` : 'Melebihi Kapasitas Roll'}`);
      lines.push(``);
    });

    lines.push(`===========================================`);
    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  const exportCSV = () => {
    const headers = ['No', 'Panjang (mm)', 'Lebar (mm)', 'Out Potong', 'MOQ (pcs)', 'Lebar Terpakai (mm)', 'Trim Waste (mm)', 'Trim Waste (%)'];
    const csvRows = computedRows.map((r, idx) => [
      idx + 1,
      r.panjang,
      r.lebar,
      r.out,
      r.moq,
      r.usedWidth,
      r.trimWasteMm,
      r.trimWastePercent,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MOQ_Karton_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono">MOQ & OUT CORRUGATOR CALCULATOR</h2>
            <p className="text-xs text-muted-foreground">Kalkulasi batas minimum order berdasarkan roll corrugator 2.480 mm.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-white/5 hover:bg-white/10 text-amber-400 border border-amber-500/30 transition-all shadow-sm"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste dari Excel</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all"
          >
            {isCopiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{isCopiedAll ? 'Berhasil Disalin!' : 'Copy Rekap MOQ'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Row Table */}
      <div className="glass-panel rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[var(--bg-table-head)] text-[var(--text-table-head)] font-black tracking-wider uppercase border-b border-[var(--border-color)]">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center text-[var(--text-table-head)] font-black">#</th>
                <th className="py-3.5 px-3 w-36 text-[var(--text-table-head)] font-black">Panjang (mm)</th>
                <th className="py-3.5 px-3 w-36 text-[var(--text-table-head)] font-black">Lebar (mm)</th>
                <th className="py-3.5 px-3 w-28 text-center text-[var(--text-table-head)] font-black">Out Mesin</th>
                <th className="py-3.5 px-3 w-40 text-right text-[var(--text-table-head)] font-black">Est. Minimum Order (MOQ)</th>
                <th className="py-3.5 px-3 min-w-[240px] text-[var(--text-table-head)] font-black">Visualisasi Potongan Roll (2480 mm)</th>
                <th className="py-3.5 px-3 w-16 text-center text-[var(--text-table-head)] font-black">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-subtle)]">
              {computedRows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-amber-500/5 transition-colors group">
                  <td className="py-3 px-3 text-center text-muted-foreground font-bold">{idx + 1}</td>

                  {/* Panjang */}
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="1"
                      value={row.panjang || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRow(idx, 'panjang', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2.5 rounded-lg bloomberg-input text-xs font-mono font-bold"
                      placeholder="Panjang"
                    />
                  </td>

                  {/* Lebar */}
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="1"
                      value={row.lebar || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRow(idx, 'lebar', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2.5 rounded-lg bloomberg-input text-xs font-mono font-bold"
                      placeholder="Lebar"
                    />
                  </td>

                  {/* Out */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black text-sm">
                      {row.out} OUT
                    </span>
                  </td>

                  {/* MOQ */}
                  <td className="py-2.5 px-3 text-right">
                    {row.isManufacturable ? (
                      <div>
                        <div className="text-base font-black text-white tracking-tight">
                          {row.moq.toLocaleString()} <span className="text-xs text-amber-400">pcs</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Min 500m run corrugator
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400 font-bold text-xs flex items-center justify-end gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Lebar &gt; 2.480 mm
                      </div>
                    )}
                  </td>

                  {/* Roll Visualization Bar */}
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 h-4 rounded-md overflow-hidden flex border border-white/10">
                        {Array.from({ length: row.out }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-amber-500 h-full border-r border-black/40 flex items-center justify-center text-[9px] font-bold text-black"
                            style={{ width: `${(row.lebar / 2480) * 100}%` }}
                            title={`Out #${i + 1}: ${row.lebar} mm`}
                          >
                            {row.out <= 4 && `L${i + 1}`}
                          </div>
                        ))}
                        {row.trimWastePercent > 0 && (
                          <div
                            className="bg-red-500/40 h-full flex items-center justify-center text-[8px] text-red-200"
                            style={{ width: `${row.trimWastePercent}%` }}
                            title={`Trim Waste: ${row.trimWasteMm} mm (${row.trimWastePercent}%)`}
                          >
                            {row.trimWastePercent > 8 && 'Waste'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Terpakai: {row.usedWidth} mm</span>
                        <span className="text-red-400">Trim: {row.trimWasteMm} mm ({row.trimWastePercent}%)</span>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => copyRow(idx)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                        title="Salin Baris"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(idx)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Baris
          </button>
          <div className="text-xs font-mono text-muted-foreground">
            Total Baris: <span className="text-white font-bold">{computedRows.length}</span>
          </div>
        </div>
      </div>

      <BulkPasteModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        mode="moq"
        onImport={(newRows) => setRows(newRows)}
      />
    </div>
  );
}
