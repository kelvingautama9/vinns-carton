import React, { useState, useMemo, useCallback } from 'react';
import { TonnageRow } from '../../types';
import { 
  calculateTonnage, 
  calculateWeightPerSheet, 
  calculateGrammage,
  normalizeSubstance,
  formatNumber,
  calculateFleetTrips,
  analyzeFleetRequirements,
  FACTORY_FLEET_STANDARDS
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
  Layers,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';
import { BulkPasteModal } from '../modals/BulkPasteModal';
import { DownloadSummaryModal } from '../modals/DownloadSummaryModal';
import { SummaryExportData } from '../../lib/summaryExport';

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
  const [isDownloadSummaryOpen, setIsDownloadSummaryOpen] = useState(false);
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

    // Factory standard fleet trips calculation (FSK: 1.8-2T, FUSO: 2.1-2.5T, FUSO ORI: 2.5-3.4T, WINGBOX: 5-6.3T)
    const fleet = calculateFleetTrips(totalTons);
    const fleetAnalysis = analyzeFleetRequirements(totalTons);

    return {
      totalTons: Number(totalTons.toFixed(4)),
      totalKg: Number(totalKg.toFixed(1)),
      totalPcs,
      totalAreaM2: Number(totalAreaM2.toFixed(1)),
      fleet,
      fleetAnalysis,
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
    lines.push(`GRAND TOTAL TONASE : ${summary.totalTons} TON (${summary.totalKg.toLocaleString('id-ID')} kg)`);
    lines.push(`TOTAL QUANTITY     : ${summary.totalPcs.toLocaleString('id-ID')} pcs (${summary.totalAreaM2} m²)`);
    lines.push(``);
    lines.push(`ESTIMASI KEBUTUHAN ARMADA PABRIK:`);
    if (summary.fleetAnalysis.isBelowMinimumDelivery) {
      lines.push(`⚠️ PERINGATAN: Total tonase belum memenuhi standar minimal pengiriman pabrik (FSK min. 1.8 Ton).`);
      lines.push(`   Kurang ${summary.fleetAnalysis.minimumShortageKg.toLocaleString('id-ID')} kg lagi untuk 1 truk FSK.`);
    }
    const { fsk, fuso, fusoOri, wingbox } = summary.fleetAnalysis.vehicles;
    lines.push(`• FSK (1.8 - 2.0 T)     : ${fsk.truckDisplay} | ${fsk.advice}`);
    lines.push(`• FUSO (2.1 - 2.5 T)    : ${fuso.truckDisplay} | ${fuso.advice}`);
    lines.push(`• FUSO ORI (2.5 - 3.4 T): ${fusoOri.truckDisplay} | ${fusoOri.advice}`);
    lines.push(`• WINGBOX (5.0 - 6.3 T) : ${wingbox.truckDisplay} | ${wingbox.advice}`);
    lines.push(`===========================================`);

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  const summaryExportData: SummaryExportData = useMemo(() => ({
    title: 'Kalkulator Berat & Tonase Karton Box',
    sourceCalculator: 'TONNAGE',
    items: computedRows.map((r, idx) => ({
      id: r.id,
      name: `Item #${idx + 1} (${r.panjang}x${r.lebar} mm)`,
      panjang: r.panjang,
      lebar: r.lebar,
      substance: r.substance,
      flute: r.flute,
      gsm: r.gsm,
      quantity: r.quantity,
      weightGram: r.weightGram,
      rowWeightKg: r.rowWeightKg,
      rowTonnageTons: r.rowTonnageTons,
      areaM2: Number(((r.panjang * r.lebar) / 1_000_000).toFixed(4)),
    })),
    totalTons: summary.totalTons,
    totalKg: summary.totalKg,
    totalPcs: summary.totalPcs,
    totalAreaM2: summary.totalAreaM2,
    fleetAnalysis: summary.fleetAnalysis,
  }), [computedRows, summary]);

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
            onClick={() => setIsDownloadSummaryOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all shadow-sm"
            title="Download Summary dalam format WhatsApp, Email, TXT & CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Summary</span>
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
      <div className="glass-panel rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[var(--bg-table-head)] text-[var(--text-table-head)] font-black tracking-wider uppercase border-b border-[var(--border-color)]">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center text-[var(--text-table-head)] font-black">#</th>
                <th className="py-3.5 px-3 w-28 text-[var(--text-table-head)] font-black">Panjang (mm)</th>
                <th className="py-3.5 px-3 w-28 text-[var(--text-table-head)] font-black">Lebar (mm)</th>
                <th className="py-3.5 px-3 min-w-[180px] text-[var(--text-table-head)] font-black">Substance</th>
                <th className="py-3.5 px-3 w-20 text-[var(--text-table-head)] font-black">Flute</th>
                <th className="py-3.5 px-3 w-28 text-[var(--text-table-head)] font-black">Quantity (pcs)</th>
                <th className="py-3.5 px-3 w-28 text-right text-[var(--text-table-head)] font-black">Berat / Pcs</th>
                <th className="py-3.5 px-3 w-36 text-right text-[var(--text-table-head)] font-black">Total Berat (kg / Ton)</th>
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
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRow(idx, 'quantity', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
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

      {/* Grand Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Tonase */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/40 to-slate-950 space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
              GRAND TOTAL TONASE ORDER
            </div>
            <Weight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
            {summary.totalTons}{' '}
            <span className="text-sm font-sans font-bold text-slate-300">TON</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Setara dengan <span className="font-bold text-slate-200 font-mono">{summary.totalKg.toLocaleString()} kg</span> total muatan
          </p>
        </div>

        {/* Total Quantity */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-900/40 space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
              TOTAL KUANTITAS LEMBARAN
            </div>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {summary.totalPcs.toLocaleString()}{' '}
            <span className="text-sm font-sans font-bold text-muted-foreground">PCS</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Total luas lembaran material: <span className="font-bold text-slate-200 font-mono">{summary.totalAreaM2} m²</span>
          </p>
        </div>
      </div>

      {/* Factory Fleet Standards Section (Standar Armada Pabrik) */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                DETAIL ESTIMASI KEBUTUHAN ARMADA (STANDAR PABRIK)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Kalkulasi kebutuhan armada otomatis berdasarkan standar muatan aman tiap jenis truk pabrik.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            4 STANDAR ARMADA
          </span>
        </div>

        {/* Global Warning: Below Smallest Fleet (FSK 1.8 Ton) */}
        {summary.fleetAnalysis.isBelowMinimumDelivery && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-800 dark:text-amber-300">
                  PERINGATAN: ORDER BELUM MEMENUHI MINIMAL PENGIRIMAN
                </h4>
                <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-sans">
                  Total tonase saat ini (<strong className="font-mono">{summary.totalTons.toFixed(4)} Ton</strong> / <strong className="font-mono">{summary.totalKg.toLocaleString('id-ID')} kg</strong>) masih di bawah batas minimal armada terkecil (<strong className="font-mono">FSK Min. 1.8 Ton / 1.800 kg</strong>).
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto shrink-0 px-3.5 py-2 rounded-xl bg-amber-500/25 border border-amber-500/40 text-center sm:text-right">
              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-300 block">
                Saran Penambahan Order
              </span>
              <span className="text-xs font-mono font-black text-amber-950 dark:text-amber-100">
                + {summary.fleetAnalysis.minimumShortageKg.toLocaleString('id-ID')} kg <span className="font-normal text-[10px]">({summary.fleetAnalysis.minimumShortageTons.toFixed(3)} Ton)</span>
              </span>
            </div>
          </div>
        )}

        {/* Global Success Banner: Reached Factory Delivery Standards */}
        {!summary.fleetAnalysis.isBelowMinimumDelivery && summary.totalKg > 0 && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Tonase memenuhi standar muatan pabrik ({summary.totalTons.toFixed(4)} Ton / {summary.totalKg.toLocaleString('id-ID')} kg)
              </span>
            </div>
            {summary.fleetAnalysis.recommendedFleet && (
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Rekomendasi Utama: {summary.fleetAnalysis.recommendedFleet.name} ({summary.fleetAnalysis.recommendedFleet.truckDisplay})
              </span>
            )}
          </div>
        )}

        {/* 4 Fleet Standard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. FSK (1.8 - 2.0 Ton) */}
          {(() => {
            const v = summary.fleetAnalysis.vehicles.fsk;
            return (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-black text-amber-400 font-mono tracking-wide">
                      ARMADA FSK
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/15 text-amber-600 dark:text-amber-300 border border-amber-400/30">
                      1.8 - 2.0 TON
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {v.status === 'underload' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        🔴 {summary.totalKg === 0 ? 'BELUM ADA MUATAN' : 'TIDAK MASUK'}
                      </span>
                    ) : v.status === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        🟢 PAS (1 TRUK)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        🟡 {v.truckCount} TRUK
                      </span>
                    )}
                  </div>

                  {/* Truck Count / Status Display */}
                  <div className="pt-1">
                    {v.status === 'underload' ? (
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black text-slate-400 dark:text-slate-500 font-mono">
                          {summary.totalKg === 0 ? '0 Truk' : 'Belum Masuk'}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {summary.totalKg === 0 ? 'Isi kuantitas box' : `Kurang dari min. ${v.minTons} Ton`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                          {v.truckDisplay}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {v.status === 'optimal' ? '1 Truk muatan optimal' : `Kapasitas terlampaui`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advice & Notice Box */}
                <div className="space-y-2">
                  <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                    v.status === 'underload'
                      ? 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25 text-rose-800 dark:text-rose-200'
                      : v.status === 'optimal'
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 text-amber-800 dark:text-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{v.status === 'underload' ? 'Saran Pemenuhan:' : v.status === 'optimal' ? 'Status Muatan:' : 'Estimasi Kebutuhan:'}</span>
                    </div>
                    <p className="text-[10.5px] font-sans">
                      {v.status === 'underload' ? (
                        summary.totalKg === 0 ? (
                          'Masukkan quantity pesanan untuk menghitung muatan.'
                        ) : (
                          <>Kurang <strong className="font-mono font-bold">+{v.shortageKg.toLocaleString('id-ID')} kg</strong> lagi ({v.shortageTons.toFixed(3)} T) untuk 1 armada FSK.</>
                        )
                      ) : v.status === 'optimal' ? (
                        <>Muatan <strong className="font-mono font-bold">{summary.totalKg.toLocaleString('id-ID')} kg</strong> pas untuk 1 armada FSK.</>
                      ) : (
                        <>Memerlukan <strong className="font-mono font-bold">{v.truckCount} Truk FSK</strong> (maks {v.maxTons} T/truk).</>
                      )}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 flex flex-col gap-0.5 font-sans">
                    <span>Standar Aman: <strong className="text-slate-200 font-mono">1.800 - 2.000 kg</strong></span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. FUSO (2.1 - 2.5 Ton) */}
          {(() => {
            const v = summary.fleetAnalysis.vehicles.fuso;
            return (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 font-mono tracking-wide">
                      ARMADA FUSO
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      2.1 - 2.5 TON
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {v.status === 'underload' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        🔴 {summary.totalKg === 0 ? 'BELUM ADA MUATAN' : 'TIDAK MASUK'}
                      </span>
                    ) : v.status === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        🟢 PAS (1 TRUK)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        🟡 {v.truckCount} TRUK
                      </span>
                    )}
                  </div>

                  {/* Truck Count / Status Display */}
                  <div className="pt-1">
                    {v.status === 'underload' ? (
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black text-slate-400 dark:text-slate-500 font-mono">
                          {summary.totalKg === 0 ? '0 Truk' : 'Belum Masuk'}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {summary.totalKg === 0 ? 'Isi kuantitas box' : `Kurang dari min. ${v.minTons} Ton`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                          {v.truckDisplay}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {v.status === 'optimal' ? '1 Truk muatan optimal' : `Kapasitas terlampaui`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advice & Notice Box */}
                <div className="space-y-2">
                  <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                    v.status === 'underload'
                      ? 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25 text-rose-800 dark:text-rose-200'
                      : v.status === 'optimal'
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 text-amber-800 dark:text-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{v.status === 'underload' ? 'Saran Pemenuhan:' : v.status === 'optimal' ? 'Status Muatan:' : 'Estimasi Kebutuhan:'}</span>
                    </div>
                    <p className="text-[10.5px] font-sans">
                      {v.status === 'underload' ? (
                        summary.totalKg === 0 ? (
                          'Masukkan quantity pesanan untuk menghitung muatan.'
                        ) : (
                          <>Kurang <strong className="font-mono font-bold">+{v.shortageKg.toLocaleString('id-ID')} kg</strong> lagi ({v.shortageTons.toFixed(3)} T) untuk 1 armada Fuso.</>
                        )
                      ) : v.status === 'optimal' ? (
                        <>Muatan <strong className="font-mono font-bold">{summary.totalKg.toLocaleString('id-ID')} kg</strong> pas untuk 1 armada Fuso.</>
                      ) : (
                        <>Memerlukan <strong className="font-mono font-bold">{v.truckCount} Truk Fuso</strong> (maks {v.maxTons} T/truk).</>
                      )}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 flex flex-col gap-0.5 font-sans">
                    <span>Standar Aman: <strong className="text-slate-200 font-mono">2.100 - 2.500 kg</strong></span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 3. FUSO ORI (2.5 - 3.4 Ton) */}
          {(() => {
            const v = summary.fleetAnalysis.vehicles.fusoOri;
            return (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-sky-500/30 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-black text-sky-500 dark:text-cyan-400 font-mono tracking-wide">
                      ARMADA FUSO ORI
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/15 text-sky-700 dark:text-cyan-300 border border-sky-500/30">
                      2.5 - 3.4 TON
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {v.status === 'underload' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        🔴 {summary.totalKg === 0 ? 'BELUM ADA MUATAN' : 'TIDAK MASUK'}
                      </span>
                    ) : v.status === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        🟢 PAS (1 TRUK)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        🟡 {v.truckCount} TRUK
                      </span>
                    )}
                  </div>

                  {/* Truck Count / Status Display */}
                  <div className="pt-1">
                    {v.status === 'underload' ? (
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black text-slate-400 dark:text-slate-500 font-mono">
                          {summary.totalKg === 0 ? '0 Truk' : 'Belum Masuk'}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {summary.totalKg === 0 ? 'Isi kuantitas box' : `Kurang dari min. ${v.minTons} Ton`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                          {v.truckDisplay}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {v.status === 'optimal' ? '1 Truk muatan optimal' : `Kapasitas terlampaui`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advice & Notice Box */}
                <div className="space-y-2">
                  <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                    v.status === 'underload'
                      ? 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25 text-rose-800 dark:text-rose-200'
                      : v.status === 'optimal'
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 text-amber-800 dark:text-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{v.status === 'underload' ? 'Saran Pemenuhan:' : v.status === 'optimal' ? 'Status Muatan:' : 'Estimasi Kebutuhan:'}</span>
                    </div>
                    <p className="text-[10.5px] font-sans">
                      {v.status === 'underload' ? (
                        summary.totalKg === 0 ? (
                          'Masukkan quantity pesanan untuk menghitung muatan.'
                        ) : (
                          <>Kurang <strong className="font-mono font-bold">+{v.shortageKg.toLocaleString('id-ID')} kg</strong> lagi ({v.shortageTons.toFixed(3)} T) untuk 1 armada Fuso Ori.</>
                        )
                      ) : v.status === 'optimal' ? (
                        <>Muatan <strong className="font-mono font-bold">{summary.totalKg.toLocaleString('id-ID')} kg</strong> pas untuk 1 armada Fuso Ori.</>
                      ) : (
                        <>Memerlukan <strong className="font-mono font-bold">{v.truckCount} Truk Fuso Ori</strong> (maks {v.maxTons} T/truk).</>
                      )}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 flex flex-col gap-0.5 font-sans">
                    <span>Standar Aman: <strong className="text-slate-200 font-mono">2.500 - 3.400 kg</strong></span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 4. WINGBOX (5.0 - 6.3 Ton) */}
          {(() => {
            const v = summary.fleetAnalysis.vehicles.wingbox;
            return (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-black text-purple-500 dark:text-purple-400 font-mono tracking-wide">
                      ARMADA WINGBOX
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                      5.0 - 6.3 TON
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {v.status === 'underload' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        🔴 {summary.totalKg === 0 ? 'BELUM ADA MUATAN' : 'TIDAK MASUK'}
                      </span>
                    ) : v.status === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        🟢 PAS (1 TRUK)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        🟡 {v.truckCount} TRUK
                      </span>
                    )}
                  </div>

                  {/* Truck Count / Status Display */}
                  <div className="pt-1">
                    {v.status === 'underload' ? (
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black text-slate-400 dark:text-slate-500 font-mono">
                          {summary.totalKg === 0 ? '0 Truk' : 'Belum Masuk'}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {summary.totalKg === 0 ? 'Isi kuantitas box' : `Kurang dari min. ${v.minTons} Ton`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                          {v.truckDisplay}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {v.status === 'optimal' ? '1 Truk muatan optimal' : `Kapasitas terlampaui`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advice & Notice Box */}
                <div className="space-y-2">
                  <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                    v.status === 'underload'
                      ? 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25 text-rose-800 dark:text-rose-200'
                      : v.status === 'optimal'
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 text-amber-800 dark:text-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{v.status === 'underload' ? 'Saran Pemenuhan:' : v.status === 'optimal' ? 'Status Muatan:' : 'Estimasi Kebutuhan:'}</span>
                    </div>
                    <p className="text-[10.5px] font-sans">
                      {v.status === 'underload' ? (
                        summary.totalKg === 0 ? (
                          'Masukkan quantity pesanan untuk menghitung muatan.'
                        ) : (
                          <>Kurang <strong className="font-mono font-bold">+{v.shortageKg.toLocaleString('id-ID')} kg</strong> lagi ({v.shortageTons.toFixed(3)} T) untuk 1 armada Wingbox.</>
                        )
                      ) : v.status === 'optimal' ? (
                        <>Muatan <strong className="font-mono font-bold">{summary.totalKg.toLocaleString('id-ID')} kg</strong> pas untuk 1 armada Wingbox.</>
                      ) : (
                        <>Memerlukan <strong className="font-mono font-bold">{v.truckCount} Truk Wingbox</strong> (maks {v.maxTons} T/truk).</>
                      )}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 flex flex-col gap-0.5 font-sans">
                    <span>Standar Aman: <strong className="text-slate-200 font-mono">5.000 - 6.300 kg</strong></span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <BulkPasteModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        mode="tonnage"
        onImport={(newRows) => setRows(newRows)}
      />

      <DownloadSummaryModal
        isOpen={isDownloadSummaryOpen}
        onClose={() => setIsDownloadSummaryOpen(false)}
        data={summaryExportData}
      />
    </div>
  );
}
