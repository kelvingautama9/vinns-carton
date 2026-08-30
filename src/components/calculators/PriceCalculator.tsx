import React, { useState, useMemo, useCallback } from 'react';
import { PriceRow } from '../../types';
import { 
  calculatePrice, 
  calculateMOQ, 
  calculateTonnage, 
  calculateWeightPerSheet, 
  formatCurrency, 
  formatNumber, 
  normalizeSubstance,
  priceList
} from '../../lib/calculations';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ClipboardPaste, 
  Download, 
  Sparkles, 
  TrendingUp, 
  Calculator,
  Layers,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { BulkPasteModal } from '../modals/BulkPasteModal';

const FLUTE_OPTIONS = ['B', 'C', 'BC', 'E'];

const POPULAR_SUBSTANCES = [
  'K125/M125/K125',
  'M100/M100/M100',
  'K110/M100/K110',
  'K125/M100/K125',
  'K200/M100/K200',
  'K275/M125/K275',
  'WK140/M100/K125',
  'WK150/M100/K125',
  'K150/M100/M100/M100/K150',
  'K200/M100/M100/M100/K200',
  'M100/M100/M100/M100/M100',
];

interface PriceCalculatorProps {
  key?: React.Key;
  initialRows?: PriceRow[];
}

export function PriceCalculator({ initialRows }: PriceCalculatorProps) {
  const [rows, setRows] = useState<PriceRow[]>(() => {
    if (initialRows && initialRows.length > 0) return initialRows;
    return [
      {
        id: `row_${Date.now()}_1`,
        panjang: 1000,
        lebar: 800,
        substance: 'K125/M125/K125',
        flute: 'B',
        diskon: 0,
      },
    ];
  });

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);

  // Update a single field in a row
  const updateRow = useCallback((index: number, field: keyof PriceRow, value: any) => {
    setRows((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  // Add new row
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}_${prev.length + 1}`,
        panjang: 1000,
        lebar: 800,
        substance: prev[prev.length - 1]?.substance || 'K125/M125/K125',
        flute: prev[prev.length - 1]?.flute || 'B',
        diskon: 0,
      },
    ]);
  };

  // Remove row
  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Bulk import from modal
  const handleBulkImport = (newRows: any[]) => {
    setRows(newRows);
  };

  // Row-level computed values
  const computedRows = useMemo(() => {
    return rows.map((row) => {
      const p = Number(row.panjang) || 0;
      const l = Number(row.lebar) || 0;
      const disc = Number(row.diskon) || 0;
      const sub = normalizeSubstance(row.substance);
      const flt = row.flute;

      const priceResult = calculatePrice({
        panjang: p,
        lebar: l,
        substance: sub,
        flute: flt,
        diskon: disc,
      });

      const moqResult = calculateMOQ({ panjang: p, lebar: l });
      const weightInfo = calculateWeightPerSheet({ panjang: p, lebar: l, substance: sub, flute: flt });

      return {
        ...row,
        priceResult,
        moqResult,
        weightInfo,
      };
    });
  }, [rows]);

  // Overall totals
  const summary = useMemo(() => {
    let totalGross = 0;
    let totalNet = 0;
    let totalAreaM2 = 0;
    let validCount = 0;

    computedRows.forEach((r) => {
      if (r.priceResult) {
        totalGross += r.priceResult.grossPrice;
        totalNet += r.priceResult.unitPrice;
        totalAreaM2 += r.weightInfo.areaM2;
        validCount++;
      }
    });

    return {
      totalGross,
      totalNet,
      totalAreaM2: Number(totalAreaM2.toFixed(3)),
      validCount,
      rowCount: computedRows.length,
    };
  }, [computedRows]);

  // Copy single row summary
  const copyRow = (index: number) => {
    const r = computedRows[index];
    if (!r) return;
    const pText = r.priceResult ? formatCurrency(r.priceResult.unitPrice) : 'N/A';
    const text = `Sheet: ${r.panjang}x${r.lebar} mm | ${r.substance} (${r.flute}) | Disc: ${r.diskon}% | Harga: ${pText}/pcs | MOQ: ${r.moqResult.moq.toLocaleString()} pcs`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Copy all rows formatted as Quote text
  const copyAll = () => {
    const lines: string[] = [];
    lines.push(`=== PENAWARAN HARGA CARTON SHEET ===`);
    lines.push(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`);
    lines.push(``);

    computedRows.forEach((r, idx) => {
      const priceStr = r.priceResult ? formatCurrency(r.priceResult.unitPrice) : 'Tidak Terdaftar';
      lines.push(`${idx + 1}. Ukuran: ${r.panjang} x ${r.lebar} mm`);
      lines.push(`   Substance : ${r.substance} (${r.flute})`);
      lines.push(`   Diskon    : ${r.diskon}%`);
      lines.push(`   Harga/pcs : ${priceStr}`);
      lines.push(`   Est. MOQ  : ${r.moqResult.moq.toLocaleString()} pcs (Out: ${r.moqResult.out})`);
      lines.push(`   Berat/pcs : ${r.weightInfo.weightGram.toFixed(1)} gram`);
      lines.push(``);
    });

    lines.push(`Total Item: ${computedRows.length} baris`);
    lines.push(`=====================================`);

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  // Export to CSV file
  const exportCSV = () => {
    const headers = [
      'No',
      'Panjang (mm)',
      'Lebar (mm)',
      'Substance',
      'Flute',
      'Diskon (%)',
      'Harga Net/Pcs (IDR)',
      'Harga Gross (IDR)',
      'Harga/m2 (IDR)',
      'MOQ (pcs)',
      'Out Mesin',
      'Berat/Pcs (gram)',
    ];

    const csvRows = computedRows.map((r, idx) => [
      idx + 1,
      r.panjang,
      r.lebar,
      `"${r.substance}"`,
      r.flute,
      r.diskon,
      r.priceResult?.unitPrice || 0,
      r.priceResult?.grossPrice || 0,
      r.priceResult?.pricePerM2 || 0,
      r.moqResult?.moq || 0,
      r.moqResult?.out || 0,
      r.weightInfo?.weightGram.toFixed(1) || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kalkulasi_Harga_Karton_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono">MULTI-ROW PRICE CALCULATOR</h2>
            <p className="text-xs text-muted-foreground">Hitung harga sheet, diskon, MOQ, dan tonase instan.</p>
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
            <span>{isCopiedAll ? 'Berhasil Disalin!' : 'Copy Quotation'}</span>
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
                <th className="py-3.5 px-3 w-28 text-[var(--text-table-head)] font-black">Panjang (mm)</th>
                <th className="py-3.5 px-3 w-28 text-[var(--text-table-head)] font-black">Lebar (mm)</th>
                <th className="py-3.5 px-3 min-w-[200px] text-[var(--text-table-head)] font-black">Substance</th>
                <th className="py-3.5 px-3 w-20 text-[var(--text-table-head)] font-black">Flute</th>
                <th className="py-3.5 px-3 w-24 text-[var(--text-table-head)] font-black">Diskon (%)</th>
                <th className="py-3.5 px-3 w-36 text-right text-[var(--text-table-head)] font-black">Harga Net / Pcs</th>
                <th className="py-3.5 px-3 w-28 text-right text-[var(--text-table-head)] font-black">MOQ & Out</th>
                <th className="py-3.5 px-3 w-28 text-right text-[var(--text-table-head)] font-black">Berat / Pcs</th>
                <th className="py-3.5 px-3 w-16 text-center text-[var(--text-table-head)] font-black">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-subtle)]">
              {computedRows.map((row, idx) => {
                const isFound = !!row.priceResult;
                return (
                  <tr key={row.id} className="hover:bg-amber-500/5 transition-colors group">
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-muted-foreground font-bold">
                      {idx + 1}
                    </td>

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

                    {/* Substance with Quick Suggestions */}
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.substance}
                          onChange={(e) => updateRow(idx, 'substance', e.target.value)}
                          list={`substance-list-${idx}`}
                          className="w-full py-1.5 px-2.5 rounded-lg bloomberg-input text-xs font-mono text-white"
                          placeholder="e.g. K125/M125/K125"
                        />
                        <datalist id={`substance-list-${idx}`}>
                          {POPULAR_SUBSTANCES.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Flute */}
                    <td className="py-2.5 px-3">
                      <select
                        value={row.flute}
                        onChange={(e) => {
                          const newFlute = e.target.value;
                          updateRow(idx, 'flute', newFlute);
                          // Auto adjust substance layers if user switches to Double Wall BC
                          const subCount = row.substance.split('/').length;
                          if (newFlute === 'BC' && subCount < 5) {
                            updateRow(idx, 'substance', 'K150/M100/M100/M100/K150');
                          } else if (['B', 'C'].includes(newFlute) && subCount > 3) {
                            updateRow(idx, 'substance', 'K125/M125/K125');
                          }
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-mono font-bold"
                      >
                        {FLUTE_OPTIONS.map((f) => (
                          <option key={f} value={f} className="bg-slate-900 text-white">
                            {f}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Diskon */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.diskon || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateRow(idx, 'diskon', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                        className="w-full py-1.5 px-2.5 rounded-lg bloomberg-input text-xs font-mono text-center"
                        placeholder="0"
                      />
                    </td>

                    {/* Harga Hasil */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      {isFound ? (
                        <div>
                          <div className="text-sm font-black text-amber-400 tracking-tight">
                            {formatCurrency(row.priceResult!.unitPrice)}
                          </div>
                          {row.diskon > 0 && (
                            <div className="text-[10px] text-muted-foreground line-through">
                              {formatCurrency(row.priceResult!.grossPrice)}
                            </div>
                          )}
                          <div className="text-[9px] text-slate-400">
                            @{formatCurrency(row.priceResult!.pricePerM2)}/m²
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-red-400 font-bold">
                          Substance / Flute tidak ditemukan
                        </div>
                      )}
                    </td>

                    {/* MOQ */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      <div className="font-bold text-white">
                        {row.moqResult.isManufacturable ? `${row.moqResult.moq.toLocaleString()} pcs` : 'N/A'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Out: {row.moqResult.out}
                      </div>
                    </td>

                    {/* Berat */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      <div className="font-bold text-emerald-400">
                        {row.weightInfo.weightGram.toFixed(1)} g
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {row.weightInfo.grammage} gsm
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Actions */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Baris
          </button>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div className="text-muted-foreground">
              Total Baris: <span className="text-white font-bold">{summary.rowCount}</span>
            </div>
            <div className="text-muted-foreground">
              Total Luas Sheet: <span className="text-amber-300 font-bold">{summary.totalAreaM2} m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            TOTAL HARGA NET PER SATUAN
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
            {formatCurrency(summary.totalNet)}
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Jumlah akumulatif harga setelah diskon untuk 1 pcs tiap item
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            TOTAL HARGA GROSS (SEBELUM DISKON)
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {formatCurrency(summary.totalGross)}
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Nilai dasar berdasarkan pricelist master m²
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
            STATUS KALKULASI
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight flex items-center gap-2">
            <span>{summary.validCount} / {summary.rowCount} VALID</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Semua formula matematis sinkron dengan corrugator roll 2480mm
          </p>
        </div>
      </div>

      {/* Bulk Paste Modal */}
      <BulkPasteModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        mode="price"
        onImport={handleBulkImport}
      />
    </div>
  );
}
