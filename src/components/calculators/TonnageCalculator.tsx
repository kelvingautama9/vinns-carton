import React, { useState, useMemo, useCallback } from 'react';
import { TonnageRow } from '../../types';
import { 
  calculateTonnage, 
  calculateWeightPerSheet, 
  calculateGrammage,
  normalizeSubstance,
  formatNumber
} from '../../lib/calculations';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ClipboardPaste, 
  Download, 
  Weight, 
  Truck, 
  Layers
} from 'lucide-react';
import { BulkPasteModal } from '../modals/BulkPasteModal';

const FLUTE_OPTIONS = ['B', 'C', 'BC', 'E'];

const POPULAR_SUBSTANCES = [
  'M100/M100/M100',
  'K125/M125/K125',
  'K110/M100/K110',
  'K125/M100/K125',
  'K200/M100/K200',
  'K275/M125/K275',
  'WK140/M100/K125',
  'K150/M100/M100/M100/K150',
  'K200/M100/M100/M100/K200',
  'M100/M100/M100/M100/M100',
];

interface TonnageCalculatorProps {
  key?: React.Key;
  initialRows?: TonnageRow[];
}

export function TonnageCalculator({ initialRows }: TonnageCalculatorProps) {
  const [rows, setRows] = useState<TonnageRow[]>(() => {
    if (initialRows && initialRows.length > 0) return initialRows;
    return [
      {
        id: `tonnage_${Date.now()}_1`,
        panjang: 1000,
        lebar: 800,
        substance: 'K125/M125/K125',
        flute: 'B',
        quantity: 2500,
      },
    ];
  });

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);

  const updateRow = useCallback((index: number, field: keyof TonnageRow, value: any) => {
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
        id: `tonnage_${Date.now()}_${prev.length + 1}`,
        panjang: 1000,
        lebar: 800,
        substance: prev[prev.length - 1]?.substance || 'K125/M125/K125',
        flute: prev[prev.length - 1]?.flute || 'B',
        quantity: 1000,
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
      const qty = Number(row.quantity) || 0;
      const sub = normalizeSubstance(row.substance);
      const flt = row.flute;

      const gsm = calculateGrammage(sub, flt);
      const weightInfo = calculateWeightPerSheet({ panjang: p, lebar: l, substance: sub, flute: flt });
      const rowTonnageTons = calculateTonnage({ panjang: p, lebar: l, substance: sub, flute: flt, quantity: qty });
      const rowWeightKg = rowTonnageTons * 1000;

      return {
        ...row,
        gsm,
        weightGram: weightInfo.weightGram,
        weightKgPerPcs: weightInfo.weightKg,
        areaM2: weightInfo.areaM2,
        rowWeightKg,
        rowTonnageTons,
      };
    });
  }, [rows]);

  const summary = useMemo(() => {
    let totalTons = 0;
    let totalKg = 0;
    let totalPcs = 0;
    let totalAreaM2 = 0;

    computedRows.forEach((r) => {
      totalTons += r.rowTonnageTons;
      totalKg += r.rowWeightKg;
      totalPcs += Number(r.quantity) || 0;
      totalAreaM2 += r.areaM2 * (Number(r.quantity) || 0);
    });

    // Logistic truck load recommendations
    // CDE (Engkel ~2.2 Ton max)
    const cdeTrips = Math.ceil(totalTons / 2.2) || 1;
    // CDD (Double ~4.5 Ton max)
    const cddTrips = Math.ceil(totalTons / 4.5) || 1;
    // Fuso (~10 Ton max)
    const fusoTrips = Math.ceil(totalTons / 10) || 1;

    return {
      totalTons: Number(totalTons.toFixed(4)),
      totalKg: Number(totalKg.toFixed(1)),
      totalPcs,
      totalAreaM2: Number(totalAreaM2.toFixed(1)),
      cdeTrips,
      cddTrips,
      fusoTrips,
    };
  }, [computedRows]);

  const copyRow = (index: number) => {
    const r = computedRows[index];
    if (!r) return;
    const text = `Sheet: ${r.panjang}x${r.lebar} mm | ${r.substance} (${r.flute}) | Qty: ${r.quantity.toLocaleString()} pcs | Berat/pcs: ${r.weightGram.toFixed(1)} g | Total: ${r.rowWeightKg.toFixed(1)} kg (${r.rowTonnageTons.toFixed(4)} Ton)`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    const lines: string[] = [];
    lines.push(`=== REKAP TONASE & BERAT PESANAN CARTON ===`);
    lines.push(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`);
    lines.push(``);

    computedRows.forEach((r, idx) => {
      lines.push(`${idx + 1}. Ukuran: ${r.panjang} x ${r.lebar} mm | Qty: ${r.quantity.toLocaleString()} pcs`);
      lines.push(`   Substance  : ${r.substance} (${r.flute}) - Total GSM: ${r.gsm}`);
      lines.push(`   Berat/pcs  : ${r.weightGram.toFixed(2)} gram (${r.weightKgPerPcs.toFixed(4)} kg)`);
      lines.push(`   Total Berat: ${r.rowWeightKg.toFixed(2)} kg (${r.rowTonnageTons.toFixed(4)} Ton)`);
      lines.push(``);
    });

    lines.push(`-------------------------------------------`);
    lines.push(`GRAND TOTAL TONASE : ${summary.totalTons} TON (${summary.totalKg.toLocaleString()} kg)`);
    lines.push(`TOTAL QUANTITY     : ${summary.totalPcs.toLocaleString()} pcs`);
    lines.push(`ESTIMASI ARMADA    : CDE (${summary.cdeTrips} rit) / CDD (${summary.cddTrips} rit) / Fuso (${summary.fusoTrips} rit)`);
    lines.push(`===========================================`);

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  const exportCSV = () => {
    const headers = [
      'No',
      'Panjang (mm)',
      'Lebar (mm)',
      'Substance',
      'Flute',
      'Quantity (pcs)',
      'Total GSM',
      'Berat/Pcs (gram)',
      'Total Berat (kg)',
      'Total Tonase (Ton)',
    ];

    const csvRows = computedRows.map((r, idx) => [
      idx + 1,
      r.panjang,
      r.lebar,
      `"${r.substance}"`,
      r.flute,
      r.quantity,
      r.gsm,
      r.weightGram.toFixed(2),
      r.rowWeightKg.toFixed(2),
      r.rowTonnageTons.toFixed(4),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tonase_Karton_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Weight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono">WEIGHT & TONNAGE CALCULATOR</h2>
            <p className="text-xs text-muted-foreground">Hitung berat sheet, GSM komposit, tonase total & armada logistik.</p>
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
            <span>{isCopiedAll ? 'Berhasil Disalin!' : 'Copy Rekap Tonase'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Row Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/50 text-muted-foreground font-bold tracking-wider uppercase border-b border-white/10">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-3 w-28">Panjang (mm)</th>
                <th className="py-3.5 px-3 w-28">Lebar (mm)</th>
                <th className="py-3.5 px-3 min-w-[180px]">Substance</th>
                <th className="py-3.5 px-3 w-20">Flute</th>
                <th className="py-3.5 px-3 w-28">Quantity (pcs)</th>
                <th className="py-3.5 px-3 w-28 text-right">Berat / Pcs</th>
                <th className="py-3.5 px-3 w-36 text-right">Total Berat (kg / Ton)</th>
                <th className="py-3.5 px-3 w-16 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {computedRows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-amber-500/5 transition-colors group">
                  <td className="py-3 px-3 text-center text-muted-foreground font-bold">{idx + 1}</td>

                  {/* Panjang */}
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="1"
                      value={row.panjang || ''}
                      onChange={(e) => updateRow(idx, 'panjang', parseFloat(e.target.value) || 0)}
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
                      onChange={(e) => updateRow(idx, 'lebar', parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2.5 rounded-lg bloomberg-input text-xs font-mono font-bold"
                      placeholder="Lebar"
                    />
                  </td>

                  {/* Substance */}
                  <td className="py-2.5 px-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.substance}
                        onChange={(e) => updateRow(idx, 'substance', e.target.value)}
                        list={`substance-list-tonnage-${idx}`}
                        className="w-full py-1.5 px-2.5 rounded-lg bloomberg-input text-xs font-mono text-white"
                        placeholder="e.g. K125/M125/K125"
                      />
                      <datalist id={`substance-list-tonnage-${idx}`}>
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
                      onChange={(e) => updateRow(idx, 'flute', e.target.value)}
                      className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-mono font-bold"
                    >
                      {FLUTE_OPTIONS.map((f) => (
                        <option key={f} value={f} className="bg-slate-900 text-white">
                          {f}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Quantity */}
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="1"
                      value={row.quantity || ''}
                      onChange={(e) => updateRow(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2.5 rounded-lg bloomberg-input text-xs font-mono font-bold text-amber-300"
                      placeholder="Quantity"
                    />
                  </td>

                  {/* Berat per pcs */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="text-sm font-bold text-white">
                      {row.weightGram.toFixed(1)} <span className="text-[10px] text-muted-foreground">g</span>
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      {row.gsm} GSM
                    </div>
                  </td>

                  {/* Total Berat */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="text-sm font-black text-amber-400">
                      {row.rowTonnageTons.toFixed(4)} <span className="text-xs font-sans">Ton</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {row.rowWeightKg.toFixed(1)} kg
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

      {/* Summary & Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tonase */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
            GRAND TOTAL TONASE
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
            {summary.totalTons}{' '}
            <span className="text-sm font-sans font-bold text-slate-300">TON</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Setara dengan {summary.totalKg.toLocaleString()} kg muatan
          </p>
        </div>

        {/* Total Quantity */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            TOTAL KUANTITAS LEMBARAN
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {summary.totalPcs.toLocaleString()}{' '}
            <span className="text-sm font-sans font-bold text-muted-foreground">PCS</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Total luas material: {summary.totalAreaM2} m²
          </p>
        </div>

        {/* Truck CDE / CDD */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            <span>ARMADA ENGKEL (CDE)</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {summary.cdeTrips}{' '}
            <span className="text-xs font-sans text-muted-foreground font-medium">Rit / Truk</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">Kapasitas beban aman maks ~2.2 Ton</p>
        </div>

        {/* Truck CDD / Fuso */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            <span>ARMADA CDD / FUSO</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {summary.cddTrips}{' '}
            <span className="text-xs font-sans text-muted-foreground font-medium">CDD (4.5T)</span>{' '}
            / {summary.fusoTrips}{' '}
            <span className="text-xs font-sans text-muted-foreground font-medium">Fuso</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">Estimasi efisiensi logistik pengiriman</p>
        </div>
      </div>

      <BulkPasteModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        mode="tonnage"
        onImport={(newRows) => setRows(newRows)}
      />
    </div>
  );
}
