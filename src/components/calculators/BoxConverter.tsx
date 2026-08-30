import React, { useState, useMemo } from 'react';
import { BoxStyle } from '../../types';
import { 
  calculateBoxToSheet, 
  priceList,
  FACTORY_JOINT_FLAPS, 
  FACTORY_CREASE_ALLOWANCES, 
  FLUTE_TAKEUP_FACTORS,
  formatNumber 
} from '../../lib/calculations';
import { 
  Box, 
  Layers, 
  Copy, 
  Check, 
  Calculator, 
  Terminal, 
  Ruler, 
  Scissors,
  CheckCircle2,
  Sliders,
  Scale,
  Sparkles,
  Info,
  Maximize2,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { DownloadSummaryModal } from '../modals/DownloadSummaryModal';
import { SummaryExportData } from '../../lib/summaryExport';

interface BoxConverterProps {
  key?: React.Key;
  onSendToPriceCalc?: (sheetP: number, sheetL: number, flute: string) => void;
  onSendToGodMode?: (sheetP: number, sheetL: number, flute: string) => void;
}

const COMMON_SUBSTANCES = [
  'K110/M125/K110',
  'K125/M125/K125',
  'K150/M125/K150',
  'K200/M125/K200',
  'K275/K200/K275',
  'K200/M150/K200',
  'WK150/M125/K125',
  'WK150/M125/K150',
  'M125/M125/M125',
  'K125/M125/M125/M125/K125',
  'K150/M125/M125/M125/K150',
  'K200/M150/M150/M150/K200',
];

export function BoxConverter({ onSendToPriceCalc, onSendToGodMode }: BoxConverterProps) {
  // 1. Box 3D Dimensions (default from user's Excel sample: P=346, L=251, T=115)
  const [boxLength, setBoxLength] = useState<number>(346); // P (mm)
  const [boxWidth, setBoxWidth] = useState<number>(251);  // L (mm)
  const [boxHeight, setBoxHeight] = useState<number>(115); // T (mm)
  const [boxStyle, setBoxStyle] = useState<BoxStyle>('RSC');
  
  // 2. Flute Selection & Custom Factors
  const [flute, setFlute] = useState<'B' | 'C' | 'BC' | 'E' | 'CUSTOM'>('C');
  const [useCustomFluteFactor, setUseCustomFluteFactor] = useState<boolean>(false);
  const [customFluteFactor, setCustomFluteFactor] = useState<number>(1.43);
  const [customFluteFactor1, setCustomFluteFactor1] = useState<number>(1.35); // For DW Flute 1
  const [customFluteFactor2, setCustomFluteFactor2] = useState<number>(1.43); // For DW Flute 2
  
  // 3. Conditional Sheet Formulas & Allowance (Lidah & Creasing)
  const [calcMode, setCalcMode] = useState<'FACTORY_EXCEL' | 'SYMMETRICAL' | 'CUSTOM'>('FACTORY_EXCEL');
  const [customJointFlap, setCustomJointFlap] = useState<number>(44);
  const [customCreaseAllowance, setCustomCreaseAllowance] = useState<number>(14);

  // 4. Substance / Paper Layers (Gramatur)
  const [substanceMode, setSubstanceMode] = useState<'CATALOG' | 'MANUAL_LAYERS'>('CATALOG');
  const [selectedSubstance, setSelectedSubstance] = useState<string>('K110/M125/K110');
  const [customTopLiner, setCustomTopLiner] = useState<number>(110);
  const [customFlute1, setCustomFlute1] = useState<number>(125);
  const [customMidLiner, setCustomMidLiner] = useState<number>(125);
  const [customFlute2, setCustomFlute2] = useState<number>(125);
  const [customBottomLiner, setCustomBottomLiner] = useState<number>(110);

  // 5. Quantity for Batch Order calculation
  const [batchQuantity, setBatchQuantity] = useState<number>(1000);
  const [copied, setCopied] = useState(false);
  const [isDownloadSummaryOpen, setIsDownloadSummaryOpen] = useState(false);

  // Master substance catalog keys from priceList
  const allSubstances = useMemo(() => {
    const keys = Object.keys(priceList);
    return keys.length > 0 ? keys : COMMON_SUBSTANCES;
  }, []);

  // Effective Flute Factor
  const effectiveFluteFactor = useMemo(() => {
    if (useCustomFluteFactor) return customFluteFactor;
    return FLUTE_TAKEUP_FACTORS[flute] || 1.43;
  }, [useCustomFluteFactor, customFluteFactor, flute]);

  // Effective Joint Flap (Lidah Lem)
  const effectiveJointFlap = useMemo(() => {
    if (calcMode === 'CUSTOM') return customJointFlap;
    return FACTORY_JOINT_FLAPS[flute] || 44;
  }, [calcMode, customJointFlap, flute]);

  // Effective Crease Allowance
  const effectiveCreaseAllowance = useMemo(() => {
    if (calcMode === 'CUSTOM') return customCreaseAllowance;
    if (calcMode === 'SYMMETRICAL') return 0;
    return FACTORY_CREASE_ALLOWANCES[flute] || 14;
  }, [calcMode, customCreaseAllowance, flute]);

  // Calculate Box to Sheet result
  const result = useMemo(() => {
    const isManualLayers = substanceMode === 'MANUAL_LAYERS';
    
    return calculateBoxToSheet({
      boxLength: Math.max(1, boxLength || 0),
      boxWidth: Math.max(1, boxWidth || 0),
      boxHeight: Math.max(1, boxHeight || 0),
      boxStyle,
      flute,
      jointFlap: effectiveJointFlap,
      creaseAllowance: effectiveCreaseAllowance,
      calcMode: calcMode === 'SYMMETRICAL' ? 'SYMMETRICAL' : 'FACTORY_EXCEL',
      customFluteFactor: useCustomFluteFactor ? customFluteFactor : undefined,
      customFluteFactor1: useCustomFluteFactor ? customFluteFactor1 : 1.35,
      customFluteFactor2: useCustomFluteFactor ? customFluteFactor2 : 1.43,
      substance: isManualLayers ? undefined : selectedSubstance,
      customLayers: isManualLayers ? {
        topLiner: customTopLiner || 0,
        fluteMedium1: customFlute1 || 0,
        middleLiner: flute === 'BC' ? (customMidLiner || 0) : undefined,
        fluteMedium2: flute === 'BC' ? (customFlute2 || 0) : undefined,
        bottomLiner: customBottomLiner || 0,
      } : undefined,
    });
  }, [
    boxLength,
    boxWidth,
    boxHeight,
    boxStyle,
    flute,
    effectiveJointFlap,
    effectiveCreaseAllowance,
    calcMode,
    useCustomFluteFactor,
    customFluteFactor,
    customFluteFactor1,
    customFluteFactor2,
    substanceMode,
    selectedSubstance,
    customTopLiner,
    customFlute1,
    customMidLiner,
    customFlute2,
    customBottomLiner,
  ]);

  // Batch calculations
  const batchTotalWeightKg = result.weightPerBoxKg * batchQuantity;
  const batchTotalTons = batchTotalWeightKg / 1000;
  const batchTotalSqm = result.sheetAreaM2 * batchQuantity;

  const handleCopySpec = () => {
    const text = [
      `📦 === VINNS BOX TO SHEET & WEIGHT REPORT === 📦`,
      `Model Box          : ${result.boxStyle} (${result.description})`,
      `Dimensi Box Jadi   : ${boxLength} x ${boxWidth} x ${boxHeight} mm (PxLxT)`,
      `Jenis Flute        : ${flute} (Faktor Tarikan: ${result.fluteFactorUsed})`,
      `Substance Kertas   : ${result.substanceUsed}`,
      `Lidah Lem (Joint)  : ${effectiveJointFlap} mm`,
      `Toleransi Lebar    : +${effectiveCreaseAllowance} mm`,
      ``,
      `📐 HASIL UKURAN SHEET BLANK & SQM:`,
      `• Panjang Sheet (P) : ${result.sheetLength} mm`,
      `• Lebar Sheet (L)   : ${result.sheetWidth} mm`,
      `• Luas Sheet / Box  : ${result.sheetAreaM2.toFixed(6)} m² (SQM)`,
      ``,
      `⚖️ GRAMATUR & BERAT KARDUS (DESIMAL MURNI):`,
      `• Total GSM Komposit: ${result.totalGsm.toFixed(2)} GSM (GSM : ${(result.totalGsm / 1000).toFixed(4)} kg)`,
      `• Berat per Box     : ${result.weightPerBoxKg.toFixed(5)} KG (${result.weightPerBoxGram.toFixed(2)} Gram)`,
      ``,
      `📊 SIMULASI BATCH (${batchQuantity.toLocaleString('id-ID')} PCS):`,
      `• Total Berat Order : ${batchTotalWeightKg.toFixed(2)} KG (${batchTotalTons.toFixed(3)} Ton)`,
      `• Total Luas Kertas : ${batchTotalSqm.toFixed(2)} m²`,
      ``,
      `🧮 LANGKAH RUMUS MATEMATIS:`,
      `1. P.Sheet : ${result.formulaBreakdown.sheetLengthFormula}`,
      `2. L.Sheet : ${result.formulaBreakdown.sheetWidthFormula}`,
      `3. SQM     : ${result.formulaBreakdown.sqmFormula}`,
      `4. GSM     : ${result.formulaBreakdown.gsmFormula}`,
      `5. Berat   : ${result.formulaBreakdown.weightFormula}`,
      `================================================`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const summaryExportData: SummaryExportData = useMemo(() => ({
    title: `Kalkulasi Konversi Box ke Sheet (${result.boxStyle})`,
    sourceCalculator: 'BOX_CONVERTER',
    items: [
      {
        name: `Box ${result.boxStyle} (${boxLength}x${boxWidth}x${boxHeight} mm)`,
        panjang: result.sheetLength,
        lebar: result.sheetWidth,
        tinggi: boxHeight,
        boxStyle: result.boxStyle,
        substance: result.substanceUsed,
        flute,
        gsm: Number(result.totalGsm.toFixed(1)),
        quantity: batchQuantity,
        weightGram: result.weightPerBoxGram,
        rowWeightKg: batchTotalWeightKg,
        rowTonnageTons: batchTotalTons,
        areaM2: result.sheetAreaM2,
      }
    ],
    totalTons: Number(batchTotalTons.toFixed(4)),
    totalKg: Number(batchTotalWeightKg.toFixed(2)),
    totalPcs: batchQuantity,
    totalAreaM2: Number(batchTotalSqm.toFixed(2)),
  }), [result, boxLength, boxWidth, boxHeight, flute, batchQuantity, batchTotalWeightKg, batchTotalTons, batchTotalSqm]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-slate-950">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-black rounded-2xl shadow-lg shadow-amber-500/25">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-mono tracking-wider">BOX DIMENSION TO SHEET CONVERTER</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                SQM & WEIGHT PRECISION
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Konversi dimensi kardus 3D ke Flat Sheet Blank, luas m² (SQM), Total GSM (desimal murni), dan kalkulasi berat (KG).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDownloadSummaryOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs font-mono tracking-wider shadow-sm transition-all"
            title="Unduh & Bagikan ringkasan dimensi, tonase, dan armada via WhatsApp/Email"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Summary</span>
          </button>

          <button
            onClick={handleCopySpec}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono tracking-wider shadow-lg shadow-amber-500/25 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Spesifikasi Disalin!' : 'Copy Laporan Box'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config & Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box Dimensions & Style */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2">
                <Ruler className="w-4 h-4" /> 1. Dimensi Box 3D & Model
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Milimeter (mm)</span>
            </div>

            {/* Model Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 font-mono">Tipe / Model Kardus</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'RSC', label: 'RSC (Standar A1)', desc: 'Box standar 4 tutup' },
                  { id: 'FOL', label: 'FOL (Full Overlap)', desc: 'Tutup tumpuk penuh' },
                  { id: 'TOP_BOTTOM', label: 'Top & Bottom', desc: 'Tutup & alas pisah (2 pcs)' },
                  { id: 'DIE_CUT_MAILER', label: 'Die Cut Mailer', desc: 'Box pizza / self-lock' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBoxStyle(item.id as BoxStyle)}
                    className={`p-3 rounded-xl text-left font-mono transition-all border ${
                      boxStyle === item.id
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20 font-bold'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-black">{item.label}</div>
                    <div className={`text-[10px] ${boxStyle === item.id ? 'text-black/80' : 'text-muted-foreground'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* P x L x T */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Panjang P (mm)</label>
                <input
                  type="number"
                  min="1"
                  value={boxLength || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setBoxLength(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-sm font-mono font-black text-amber-300"
                  placeholder="346"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Lebar L (mm)</label>
                <input
                  type="number"
                  min="1"
                  value={boxWidth || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setBoxWidth(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-sm font-mono font-black text-amber-300"
                  placeholder="251"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Tinggi T (mm)</label>
                <input
                  type="number"
                  min="1"
                  value={boxHeight || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setBoxHeight(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-sm font-mono font-black text-amber-300"
                  placeholder="115"
                />
              </div>
            </div>
          </div>

          {/* Flute & Take-up Factor Options */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> 2. Flute & Faktor Tarikan
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Take-Up Ratio</span>
            </div>

            {/* Flute Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 font-mono">Jenis Flute Corrugated</label>
              <div className="grid grid-cols-4 gap-2">
                {(['B', 'C', 'BC', 'E'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setFlute(f);
                      if (f === 'B') setCustomFluteFactor(1.35);
                      if (f === 'C') setCustomFluteFactor(1.43);
                      if (f === 'E') setCustomFluteFactor(1.25);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-center font-mono transition-all border ${
                      flute === f
                        ? 'bg-amber-500 text-black border-amber-500 font-black shadow-md shadow-amber-500/20'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-sm font-black">{f}</div>
                    <div className={`text-[10px] ${flute === f ? 'text-black/80 font-bold' : 'text-muted-foreground'}`}>
                      {f === 'B' ? '1.35x' : f === 'C' ? '1.43x' : f === 'E' ? '1.25x' : 'DW (BC)'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Flute Factor Input Option */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomFluteFactor}
                  onChange={(e) => setUseCustomFluteFactor(e.target.checked)}
                  className="rounded border-amber-500/50 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-amber-300 font-mono">
                  🔧 Input Manual Faktor Flute (Fleksibel / Custom)
                </span>
              </label>

              {useCustomFluteFactor && (
                <div className="pt-2 animate-in fade-in space-y-2">
                  {flute === 'BC' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-300 font-mono font-bold">Faktor Flute 1 (B)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={customFluteFactor1 || ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setCustomFluteFactor1(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          className="w-full py-1.5 px-3 rounded-lg bloomberg-input text-xs font-mono font-bold text-amber-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-300 font-mono font-bold">Faktor Flute 2 (C)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={customFluteFactor2 || ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setCustomFluteFactor2(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          className="w-full py-1.5 px-3 rounded-lg bloomberg-input text-xs font-mono font-bold text-amber-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] text-slate-300 font-mono">
                        <span className="font-bold">Nilai Faktor Flute {flute}:</span>
                        <span className="text-muted-foreground">Desimal murni</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={customFluteFactor || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setCustomFluteFactor(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                        className="w-full py-2 px-3 rounded-lg bloomberg-input text-xs font-mono font-black text-amber-300"
                        placeholder="Contoh: 1.43 atau 1.35"
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground font-mono">
                    * Berguna saat formula faktor flute pabrik sedang dalam proses development / penyesuaian mesin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Conditional Formulas & Tolerances (Lidah Lem & Creasing Allowance) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4" /> 3. Kondisional Rumus & Lidah
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Formula Settings</span>
            </div>

            {/* Mode Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 font-mono">Mode Rumus Sheet</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'FACTORY_EXCEL', label: 'Standar Pabrik', sub: 'Excel (+44 & +14)' },
                  { id: 'SYMMETRICAL', label: 'Simetris Murni', sub: '2x(L/2) + T' },
                  { id: 'CUSTOM', label: 'Kustom Manual', sub: 'Input Bebas' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setCalcMode(mode.id as any)}
                    className={`p-2.5 rounded-xl text-left font-mono transition-all border ${
                      calcMode === mode.id
                        ? 'bg-amber-500 text-black border-amber-500 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-black">{mode.label}</div>
                    <div className={`text-[9px] truncate ${calcMode === mode.id ? 'text-black/80' : 'text-muted-foreground'}`}>
                      {mode.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable or Displayed Values for Joint Flap and Allowance */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 font-mono">
                  Lidah Lem / Joint (P.Sheet)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={calcMode !== 'CUSTOM'}
                    value={calcMode === 'CUSTOM' ? (customJointFlap || '') : effectiveJointFlap}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setCustomJointFlap(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-bold ${
                      calcMode === 'CUSTOM'
                        ? 'bloomberg-input text-amber-300'
                        : 'bg-black/40 text-slate-400 border border-white/5'
                    }`}
                    placeholder="44"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-muted-foreground font-mono">mm</span>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">
                  {flute === 'C' ? 'Default C: +44mm' : flute === 'B' ? 'Default B: +40mm' : 'Default: +50mm'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 font-mono">
                  Toleransi Lebar (L.Sheet)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={calcMode !== 'CUSTOM'}
                    value={calcMode === 'CUSTOM' ? (customCreaseAllowance || '') : effectiveCreaseAllowance}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setCustomCreaseAllowance(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-bold ${
                      calcMode === 'CUSTOM'
                        ? 'bloomberg-input text-amber-300'
                        : 'bg-black/40 text-slate-400 border border-white/5'
                    }`}
                    placeholder="14"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-muted-foreground font-mono">mm</span>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">
                  {flute === 'C' ? 'Default C: +14mm' : flute === 'B' ? 'Default B: +10mm' : 'Default: +18mm'}
                </span>
              </div>
            </div>
          </div>

          {/* Substance / Paper Grammage Section */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2">
                <Scale className="w-4 h-4" /> 4. Substance Kertas (Gramatur)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Pure Decimal GSM</span>
            </div>

            {/* Substance Mode Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubstanceMode('CATALOG')}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all border ${
                  substanceMode === 'CATALOG'
                    ? 'bg-amber-500 text-black border-amber-500'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                Pilih Master Catalog
              </button>
              <button
                type="button"
                onClick={() => setSubstanceMode('MANUAL_LAYERS')}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all border ${
                  substanceMode === 'MANUAL_LAYERS'
                    ? 'bg-amber-500 text-black border-amber-500'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                Input Per Lapisan (GSM)
              </button>
            </div>

            {substanceMode === 'CATALOG' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-mono">Pilih Substance:</label>
                <select
                  value={selectedSubstance}
                  onChange={(e) => setSelectedSubstance(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold text-amber-300 cursor-pointer"
                >
                  {allSubstances.map((sub) => (
                    <option key={sub} value={sub} className="bg-slate-900 text-white">
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-300 font-mono font-bold">Top Liner</span>
                    <input
                      type="number"
                      value={customTopLiner || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setCustomTopLiner(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-mono font-bold text-center"
                      placeholder="110"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-300 font-mono font-bold">Flute Medium 1</span>
                    <input
                      type="number"
                      value={customFlute1 || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setCustomFlute1(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-mono font-bold text-amber-300 text-center"
                      placeholder="125"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-300 font-mono font-bold">Bottom Liner</span>
                    <input
                      type="number"
                      value={customBottomLiner || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setCustomBottomLiner(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-mono font-bold text-center"
                      placeholder="110"
                    />
                  </div>
                </div>

                {flute === 'BC' && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-300 font-mono font-bold">Middle Liner</span>
                      <input
                        type="number"
                        value={customMidLiner || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setCustomMidLiner(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                        className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-mono font-bold text-center"
                        placeholder="125"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-300 font-mono font-bold">Flute Medium 2</span>
                      <input
                        type="number"
                        value={customFlute2 || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setCustomFlute2(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                        className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-mono font-bold text-amber-300 text-center"
                        placeholder="125"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Results, SQM, Weight, Math Proof & Blueprint (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Primary Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sheet Size & SQM Card */}
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-950 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Scissors className="w-4 h-4" /> UKURAN SHEET BLANK (PxL)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 font-mono">
                  {flute} Flute
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  <span className="text-amber-400">{result.sheetLength}</span>{' '}
                  <span className="text-slate-400 text-2xl font-light">x</span>{' '}
                  <span className="text-amber-400">{result.sheetWidth}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground font-mono">mm</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">Luas / SQM per Box:</span>
                <span className="text-sm font-black text-white font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  {result.sheetAreaM2.toFixed(6)} m²
                </span>
              </div>
            </div>

            {/* Weight per Box Card */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-slate-950 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4" /> BERAT PER BOX (WEIGHT)
                </span>
                <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  GSM : {(result.totalGsm / 1000).toFixed(4)} kg
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  {result.weightPerBoxKg.toFixed(5)}
                </div>
                <span className="text-sm font-bold text-slate-300 font-mono">KG / Pcs</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">Bobot Gramasi:</span>
                <span className="text-sm font-black text-emerald-300 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {result.weightPerBoxGram.toFixed(2)} Gram
                </span>
              </div>
            </div>
          </div>

          {/* Batch Order Quantity Estimator */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" /> Simulasi Total Batch Order
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground font-mono">Qty Pesanan:</span>
                <input
                  type="number"
                  min="1"
                  value={batchQuantity || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setBatchQuantity(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  className="w-24 py-1 px-2 rounded-lg bloomberg-input text-xs font-mono font-black text-amber-300 text-center"
                  placeholder="1000"
                />
                <span className="text-xs font-mono text-slate-300 font-bold">Pcs</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Total Berat (KG)</span>
                <div className="text-lg font-black text-white font-mono">
                  {formatNumber(batchTotalWeightKg, 2)} kg
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Total Tonase (Ton)</span>
                <div className="text-lg font-black text-amber-400 font-mono">
                  {batchTotalTons.toFixed(3)} Ton
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Total Luas Kertas</span>
                <div className="text-lg font-black text-slate-200 font-mono">
                  {formatNumber(batchTotalSqm, 2)} m²
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Proof & Formula Breakdown Panel (Sesuai Excel User) */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-black/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Bedah Langkah Rumus Perhitungan Matematis (Transparan)
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Formula Breakdown</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs text-slate-300">
              {/* Step 1: Panjang Sheet */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-400 font-bold">1. Panjang Sheet (P.Sheet):</span>
                <span className="text-amber-300 font-black">{result.formulaBreakdown.sheetLengthFormula}</span>
              </div>

              {/* Step 2: Lebar Sheet */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-400 font-bold">2. Lebar Sheet (L.Sheet):</span>
                <span className="text-amber-300 font-black">{result.formulaBreakdown.sheetWidthFormula}</span>
              </div>

              {/* Step 3: Luas SQM */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-400 font-bold">3. Luas SQM (m²):</span>
                <span className="text-white font-black">{result.formulaBreakdown.sqmFormula}</span>
              </div>

              {/* Step 4: Total GSM */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">4. Total GSM (Desimal Murni):</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[11px] font-bold border border-emerald-500/20 font-mono">
                    GSM : {(result.totalGsm / 1000).toFixed(4)} kg
                  </span>
                </div>
                <span className="text-emerald-300 font-black">{result.formulaBreakdown.gsmFormula}</span>
              </div>

              {/* Step 5: Berat Box */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-emerald-400 font-bold">5. Berat Box (Weight KG):</span>
                <span className="text-emerald-300 font-black">{result.formulaBreakdown.weightFormula}</span>
              </div>
            </div>
          </div>

          {/* Interactive 2D Blueprint Schematic */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> Skema Garis Scoring & Lipatan (Creasing Layout)
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">2D Flat Layout</span>
            </div>

            {/* SVG Diagram */}
            <div className="w-full bg-black/70 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
              {boxStyle === 'RSC' || boxStyle === 'FOL' ? (
                <div className="w-full max-w-lg space-y-3">
                  {/* Top Creasing Dimension Label */}
                  <div className="flex justify-between text-[11px] font-mono text-amber-300 font-bold px-1">
                    <span>P: {boxLength}</span>
                    <span>L: {boxWidth}</span>
                    <span>P: {boxLength}</span>
                    <span>L: {boxWidth}</span>
                    <span>Lap: {effectiveJointFlap}</span>
                  </div>

                  {/* SVG Box Representation */}
                  <svg viewBox="0 0 500 240" className="w-full h-auto text-amber-400">
                    <rect x="10" y="10" width="480" height="220" fill="none" stroke="#f59e0b" strokeWidth="2" rx="4" />
                    
                    {/* Horizontal creasing lines */}
                    <line x1="10" y1="70" x2="490" y2="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,5" />
                    <line x1="10" y1="170" x2="490" y2="170" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,5" />

                    {/* Vertical creasing lines */}
                    <line x1="150" y1="10" x2="150" y2="230" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
                    <line x1="240" y1="10" x2="240" y2="230" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
                    <line x1="380" y1="10" x2="380" y2="230" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
                    <line x1="470" y1="10" x2="470" y2="230" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />

                    {/* Panel Labels */}
                    <text x="75" y="125" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">PANEL 1 (P)</text>
                    <text x="195" y="125" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">PANEL 2 (L)</text>
                    <text x="310" y="125" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">PANEL 3 (P)</text>
                    <text x="425" y="125" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">PANEL 4 (L)</text>
                    <text x="480" y="125" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">FLAP</text>

                    {/* Flap height annotations */}
                    <text x="75" y="45" fill="#94a3b8" fontSize="10" textAnchor="middle">
                      Tutup Atas ({result.creasingWidth[0] || Math.round(boxWidth / 2)} mm)
                    </text>
                    <text x="75" y="205" fill="#94a3b8" fontSize="10" textAnchor="middle">
                      Tutup Bawah ({result.creasingWidth[2] || Math.round(boxWidth / 2)} mm)
                    </text>
                  </svg>

                  {/* Bottom Width Dimension Breakdown */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1">
                    <span>Tutup Atas: {result.creasingWidth[0]} mm</span>
                    <span>Tinggi Badan (T): {boxHeight} mm</span>
                    <span>Tutup Bawah: {result.creasingWidth[2]} mm</span>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md py-6 text-center space-y-2">
                  <div className="text-amber-400 font-mono font-bold text-sm">
                    Model: {boxStyle}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Creasing Panjang: {result.creasingLength.join(' - ')} mm
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Creasing Lebar: {result.creasingWidth.join(' - ')} mm
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Forward Actions */}
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono">
              Lanjutkan ukuran Sheet ({result.sheetLength} x {result.sheetWidth} mm) ke kalkulator lain:
            </div>
            <div className="flex items-center gap-2">
              {onSendToPriceCalc && (
                <button
                  onClick={() => onSendToPriceCalc(result.sheetLength, result.sheetWidth, flute)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono transition-colors shadow-lg shadow-amber-500/20"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Hitung Harga Sheet</span>
                </button>
              )}
              {onSendToGodMode && (
                <button
                  onClick={() => onSendToGodMode(result.sheetLength, result.sheetWidth, flute)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold font-mono transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Buka di God Mode</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <DownloadSummaryModal
        isOpen={isDownloadSummaryOpen}
        onClose={() => setIsDownloadSummaryOpen(false)}
        data={summaryExportData}
      />
    </div>
  );
}

