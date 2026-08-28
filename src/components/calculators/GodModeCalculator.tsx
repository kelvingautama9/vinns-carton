import React, { useState, useMemo } from 'react';
import { 
  calculatePrice, 
  calculateMOQ, 
  calculateTonnage, 
  calculateWeightPerSheet, 
  calculateGrammage, 
  formatCurrency, 
  formatNumber, 
  normalizeSubstance 
} from '../../lib/calculations';
import { 
  Terminal, 
  Copy, 
  Check, 
  Zap, 
  Layers, 
  Package, 
  Weight, 
  Calculator, 
  Share2, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

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

interface GodModeCalculatorProps {
  key?: React.Key;
  initialValues?: {
    panjang: number;
    lebar: number;
    substance: string;
    flute: string;
    diskon?: number;
    quantity?: number;
  };
  onNavigate?: (tab: string) => void;
}

export function GodModeCalculator({ initialValues, onNavigate }: GodModeCalculatorProps) {
  const [panjang, setPanjang] = useState<number>(initialValues?.panjang || 1000);
  const [lebar, setLebar] = useState<number>(initialValues?.lebar || 800);
  const [substance, setSubstance] = useState<string>(initialValues?.substance || 'K125/M125/K125');
  const [flute, setFlute] = useState<string>(initialValues?.flute || 'B');
  const [diskon, setDiskon] = useState<number>(initialValues?.diskon || 0);
  const [quantity, setQuantity] = useState<number>(initialValues?.quantity || 2500);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const p = Math.max(0, panjang || 0);
    const l = Math.max(0, lebar || 0);
    const disc = Math.max(0, diskon || 0);
    const qty = Math.max(1, quantity || 1);
    const sub = normalizeSubstance(substance);
    const flt = flute;

    const priceRes = calculatePrice({ panjang: p, lebar: l, substance: sub, flute: flt, diskon: disc });
    const moqRes = calculateMOQ({ panjang: p, lebar: l });
    const weightRes = calculateWeightPerSheet({ panjang: p, lebar: l, substance: sub, flute: flt });
    const totalTons = calculateTonnage({ panjang: p, lebar: l, substance: sub, flute: flt, quantity: qty });
    const gsm = calculateGrammage(sub, flt);

    const totalGrossOrder = (priceRes?.grossPrice || 0) * qty;
    const totalNetOrder = (priceRes?.unitPrice || 0) * qty;

    return {
      priceRes,
      moqRes,
      weightRes,
      totalTons,
      gsm,
      totalGrossOrder,
      totalNetOrder,
      areaM2: weightRes.areaM2,
      weightGram: weightRes.weightGram,
      weightKg: weightRes.weightKg,
      totalWeightKg: totalTons * 1000,
    };
  }, [panjang, lebar, substance, flute, diskon, quantity]);

  const handleCopyAll = () => {
    const { priceRes, moqRes, weightGram, totalTons, gsm, areaM2, totalNetOrder } = results;
    const priceText = priceRes ? formatCurrency(priceRes.unitPrice) : 'Tidak Terdaftar';
    const grossText = priceRes ? formatCurrency(priceRes.grossPrice) : '-';

    const text = [
      `⚡ === VINNS GOD MODE CALCULATION REPORT === ⚡`,
      `Spesifikasi Sheet:`,
      `• Dimensi      : ${panjang} x ${lebar} mm (${areaM2.toFixed(4)} m²)`,
      `• Substance    : ${substance} (${flute})`,
      `• Total GSM    : ${gsm} gsm`,
      `• Kuantitas    : ${quantity.toLocaleString()} pcs`,
      `• Diskon       : ${diskon}%`,
      ``,
      `Hasil Perhitungan:`,
      `• Harga Satuan : ${priceText}/pcs (Gross: ${grossText})`,
      `• Total Pesanan: ${formatCurrency(totalNetOrder)}`,
      `• Est. MOQ     : ${moqRes.moq.toLocaleString()} pcs (Out: ${moqRes.out} out)`,
      `• Berat Satuan : ${weightGram.toFixed(2)} gram / pcs`,
      `• Total Berat  : ${totalTons.toFixed(4)} TON (${results.totalWeightKg.toFixed(1)} kg)`,
      `==============================================`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-slate-950">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-black rounded-2xl shadow-lg shadow-amber-500/25">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-mono tracking-wider">GOD MODE ALL-IN-ONE TERMINAL</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                INSTANT SYNC
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Kalkulasi parameter karton secara terpadu dalam satu pandangan.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono tracking-wider shadow-lg shadow-amber-500/25 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Semua Hasil Disalin!' : 'Copy Full Report'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4" /> Parameter Input
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Real-time Reactive</span>
            </div>

            {/* PxL mm */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Panjang (mm)</label>
                <input
                  type="number"
                  min="1"
                  value={panjang || ''}
                  onChange={(e) => setPanjang(parseFloat(e.target.value) || 0)}
                  className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-sm font-mono font-black text-amber-300"
                  placeholder="Panjang"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Lebar (mm)</label>
                <input
                  type="number"
                  min="1"
                  value={lebar || ''}
                  onChange={(e) => setLebar(parseFloat(e.target.value) || 0)}
                  className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-sm font-mono font-black text-amber-300"
                  placeholder="Lebar"
                />
              </div>
            </div>

            {/* Substance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 font-mono">Substance Kertas</label>
                <span className="text-[10px] text-muted-foreground">K/M/WK/TL/Duplex</span>
              </div>
              <input
                type="text"
                value={substance}
                onChange={(e) => setSubstance(e.target.value)}
                list="god-substance-suggestions"
                className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-sm font-mono text-white font-bold"
                placeholder="Contoh: K125/M125/K125"
              />
              <datalist id="god-substance-suggestions">
                {POPULAR_SUBSTANCES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {/* Flute */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono">Jenis Flute Corrugator</label>
              <div className="grid grid-cols-4 gap-2">
                {FLUTE_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setFlute(f);
                      const subParts = substance.split('/').length;
                      if (f === 'BC' && subParts < 5) {
                        setSubstance('K150/M100/M100/M100/K150');
                      } else if (['B', 'C'].includes(f) && subParts > 3) {
                        setSubstance('K125/M125/K125');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black font-mono transition-all border ${
                      flute === f
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Diskon & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Diskon (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={diskon || 0}
                  onChange={(e) => setDiskon(parseFloat(e.target.value) || 0)}
                  className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-sm font-mono text-center"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Kuantitas Order (pcs)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-full py-2.5 px-3 rounded-xl bloomberg-input text-sm font-mono font-bold text-emerald-400 text-right"
                  placeholder="2500"
                />
              </div>
            </div>

            {/* Quick action buttons */}
            {onNavigate && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                  Lanjutkan Analisis Spesifik:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate('box-converter')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold font-mono transition-colors"
                  >
                    <span>Box Converter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onNavigate('cost-simulator')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-bold font-mono transition-colors"
                  >
                    <span>Cost Breakdown</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Results Dashboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Price & Order Value Card */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900/50 to-slate-950 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Calculator className="w-36 h-36 text-amber-400" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono tracking-widest">
                  ESTIMASI HARGA SATUAN (NET)
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  @{formatCurrency(results.priceRes?.pricePerM2 || 0)} / m²
                </span>
              </div>

              <div className="flex items-baseline gap-4">
                <div className="text-4xl md:text-5xl font-black text-amber-400 font-mono tracking-tight">
                  {results.priceRes ? formatCurrency(results.priceRes.unitPrice) : 'Tidak Terdaftar'}
                </div>
                {diskon > 0 && results.priceRes && (
                  <div className="text-sm text-muted-foreground line-through font-mono">
                    {formatCurrency(results.priceRes.grossPrice)}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">Total Nilai Pesanan</div>
                  <div className="text-xl font-bold text-white font-mono">
                    {formatCurrency(results.totalNetOrder)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">Luas per Lembar</div>
                  <div className="text-xl font-bold text-slate-200 font-mono">
                    {results.areaM2.toFixed(4)} <span className="text-xs text-muted-foreground">m²</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Bento Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MOQ Card */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">MINIMUM ORDER (MOQ)</span>
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {results.moqRes.isManufacturable ? `${results.moqRes.moq.toLocaleString()} pcs` : 'N/A'}
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Out Corrugator: <span className="font-bold text-amber-300">{results.moqRes.out} Potong</span> (Roll 2480mm)
              </p>
            </div>

            {/* Berat Satuan Card */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">BERAT PER LEMBAR</span>
                <Weight className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {results.weightGram.toFixed(2)} <span className="text-sm font-sans font-bold">gram</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Total Komposit: <span className="font-bold text-white">{results.gsm} GSM</span>
              </p>
            </div>

            {/* Total Tonase Pesanan */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">TOTAL TONASE PESANAN</span>
                <Weight className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {results.totalTons.toFixed(4)} <span className="text-sm font-sans font-bold">TON</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Total Muatan: <span className="font-bold text-white">{results.totalWeightKg.toFixed(1)} kg</span>
              </p>
            </div>

            {/* Flute Factor Spec */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">STRUKTUR KERTAS</span>
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-lg font-bold text-white font-mono truncate">
                {normalizeSubstance(substance)}
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Flute {flute} (Take-up factor: {flute === 'B' ? '1.35x' : flute === 'C' ? '1.43x' : '1.25x - 1.43x'})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
