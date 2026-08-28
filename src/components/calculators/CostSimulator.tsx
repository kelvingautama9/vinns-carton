import React, { useState, useMemo } from 'react';
import { PaperLayer, CostSimulationParams, CostSimulationResult } from '../../types';
import { calculateCustomCostBreakdown, formatCurrency, formatNumber } from '../../lib/calculations';
import { 
  Cpu, 
  Layers, 
  DollarSign, 
  Copy, 
  Check, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calculator, 
  ArrowRight,
  PieChart,
  Percent,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface CostSimulatorProps {
  onSendToPriceCalc?: (sheetP: number, sheetL: number, substance: string, flute: string) => void;
}

const DEFAULT_PAPER_PRICES: Record<string, number> = {
  K: 11500,  // Kraft Liner Rp/kg
  M: 8200,   // Corrugating Medium Rp/kg
  WK: 14500, // White Kraft Rp/kg
  TL: 9500,  // Test Liner Rp/kg
  D: 9000,   // Duplex Rp/kg
};

export function CostSimulator({ onSendToPriceCalc }: CostSimulatorProps) {
  // Dimensions
  const [panjang, setPanjang] = useState<number>(1000);
  const [lebar, setLebar] = useState<number>(800);
  const [flute, setFlute] = useState<'B' | 'C' | 'BC' | 'E'>('B');
  const [quantity, setQuantity] = useState<number>(2000);

  // Additional production costs & margins
  const [glueCostPerM2, setGlueCostPerM2] = useState<number>(250);
  const [convertingCostPerM2, setConvertingCostPerM2] = useState<number>(550);
  const [wastePercent, setWastePercent] = useState<number>(5);
  const [marginPercent, setMarginPercent] = useState<number>(18);
  const [copied, setCopied] = useState(false);

  // Layers state
  const [layers, setLayers] = useState<PaperLayer[]>([
    { type: 'top_liner', paperType: 'K', gsm: 125, pricePerKg: 11500, takeUpFactor: 1.0 },
    { type: 'flute', paperType: 'M', gsm: 125, pricePerKg: 8200, takeUpFactor: 1.35 },
    { type: 'bottom_liner', paperType: 'K', gsm: 125, pricePerKg: 11500, takeUpFactor: 1.0 },
  ]);

  // Handle flute change preset
  const handleFluteChange = (newFlute: 'B' | 'C' | 'BC' | 'E') => {
    setFlute(newFlute);
    if (newFlute === 'B') {
      setLayers([
        { type: 'top_liner', paperType: 'K', gsm: 125, pricePerKg: 11500, takeUpFactor: 1.0 },
        { type: 'flute', paperType: 'M', gsm: 125, pricePerKg: 8200, takeUpFactor: 1.35 },
        { type: 'bottom_liner', paperType: 'K', gsm: 125, pricePerKg: 11500, takeUpFactor: 1.0 },
      ]);
    } else if (newFlute === 'C') {
      setLayers([
        { type: 'top_liner', paperType: 'K', gsm: 125, pricePerKg: 11500, takeUpFactor: 1.0 },
        { type: 'flute', paperType: 'M', gsm: 125, pricePerKg: 8200, takeUpFactor: 1.43 },
        { type: 'bottom_liner', paperType: 'K', gsm: 125, pricePerKg: 11500, takeUpFactor: 1.0 },
      ]);
    } else if (newFlute === 'E') {
      setLayers([
        { type: 'top_liner', paperType: 'K', gsm: 125, pricePerKg: 11500, takeUpFactor: 1.0 },
        { type: 'flute', paperType: 'M', gsm: 125, pricePerKg: 8200, takeUpFactor: 1.25 },
        { type: 'bottom_liner', paperType: 'K', gsm: 125, pricePerKg: 11500, takeUpFactor: 1.0 },
      ]);
    } else if (newFlute === 'BC') {
      setLayers([
        { type: 'top_liner', paperType: 'K', gsm: 150, pricePerKg: 11500, takeUpFactor: 1.0 },
        { type: 'flute', paperType: 'M', gsm: 125, pricePerKg: 8200, takeUpFactor: 1.35 },
        { type: 'middle_liner', paperType: 'M', gsm: 125, pricePerKg: 8200, takeUpFactor: 1.0 },
        { type: 'flute', paperType: 'M', gsm: 125, pricePerKg: 8200, takeUpFactor: 1.43 },
        { type: 'bottom_liner', paperType: 'K', gsm: 150, pricePerKg: 11500, takeUpFactor: 1.0 },
      ]);
    }
  };

  // Update a layer field
  const updateLayer = (index: number, field: keyof PaperLayer, value: any) => {
    setLayers((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value };
      // Auto update paper price if paperType changed
      if (field === 'paperType' && DEFAULT_PAPER_PRICES[value]) {
        next[index].pricePerKg = DEFAULT_PAPER_PRICES[value];
      }
      return next;
    });
  };

  // Calculate comprehensive results
  const result = useMemo(() => {
    return calculateCustomCostBreakdown({
      layers,
      glueCostPerM2: Math.max(0, glueCostPerM2 || 0),
      conversionCostPerM2: Math.max(0, convertingCostPerM2 || 0),
      wastePercent: Math.max(0, wastePercent || 0),
      marginPercent: Math.max(0, marginPercent || 0),
      sheetLength: Math.max(1, panjang || 0),
      sheetWidth: Math.max(1, lebar || 0),
      quantity: Math.max(1, quantity || 1),
    });
  }, [layers, glueCostPerM2, convertingCostPerM2, wastePercent, marginPercent, panjang, lebar, quantity]);

  // Derived substance code
  const substanceCode = useMemo(() => {
    return layers.map((l) => `${l.paperType}${l.gsm}`).join('/');
  }, [layers]);

  const handleCopyBreakdown = () => {
    const text = [
      `📊 === VINNS CUSTOM SUBSTANCE & COST BREAKDOWN === 📊`,
      `Spesifikasi Kustom:`,
      `• Kode Substance  : ${substanceCode} (${flute})`,
      `• Ukuran Sheet    : ${panjang} x ${lebar} mm (${result.areaM2.toFixed(4)} m²)`,
      `• Total GSM       : ${result.totalGrammage.toFixed(1)} gsm`,
      `• Kuantitas       : ${quantity.toLocaleString()} pcs`,
      ``,
      `Rincian Biaya (HPP / m²):`,
      `• Biaya Kertas    : ${formatCurrency(result.rawPaperCostPerM2)} / m²`,
      `• Biaya Lem       : ${formatCurrency(result.glueCostPerM2)} / m²`,
      `• Biaya Konversi  : ${formatCurrency(result.convertingCostPerM2)} / m²`,
      `• Waste (${wastePercent}%)     : ${formatCurrency(result.wasteCostPerM2)} / m²`,
      `• Total HPP / m²  : ${formatCurrency(result.totalCostPerM2)} / m²`,
      ``,
      `Harga Jual & Profitabilitas:`,
      `• HPP per Sheet   : ${formatCurrency(result.totalCostPerSheet)} / pcs`,
      `• Margin Target   : ${marginPercent}%`,
      `• HARGA JUAL/PCS  : ${formatCurrency(result.sellingPricePerSheet)} / pcs`,
      `• Total Omset     : ${formatCurrency(result.totalOrderValue)}`,
      `• Total Profit    : ${formatCurrency(result.totalProfit)}`,
      `==================================================`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-slate-950">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-black rounded-2xl shadow-lg shadow-amber-500/25">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-mono tracking-wider">
                SUBSTANCE CUSTOM & COST SIMULATOR
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                SPECIAL MODULE
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Simulasi biaya HPP lembaran custom per lapis kertas, lem, ongkos mesin corrugator & margin target.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyBreakdown}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono tracking-wider shadow-lg shadow-amber-500/25 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Breakdown Disalin!' : 'Copy Cost Breakdown'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Layer Buildup & Params (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Flute & Sheet Dimension Setup */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4" /> 1. Parameter Lembaran & Flute
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Kode: {substanceCode}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Panjang (mm)</label>
                <input
                  type="number"
                  min="1"
                  value={panjang || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setPanjang(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold text-amber-300"
                  placeholder="1000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Lebar (mm)</label>
                <input
                  type="number"
                  min="1"
                  value={lebar || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setLebar(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold text-amber-300"
                  placeholder="800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Flute Profile</label>
                <select
                  value={flute}
                  onChange={(e) => handleFluteChange(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold"
                >
                  <option value="B">B-Flute (1.35x)</option>
                  <option value="C">C-Flute (1.43x)</option>
                  <option value="BC">BC-Double Wall</option>
                  <option value="E">E-Flute (1.25x)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Kuantitas (pcs)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setQuantity(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold text-emerald-400"
                  placeholder="2000"
                />
              </div>
            </div>
          </div>

          {/* Paper Layers Config Table */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> 2. Susunan Lapisan Kertas (Layer Buildup)
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {layers.length} Lapis | {result.totalGrammage.toFixed(0)} GSM
              </span>
            </div>

            <div className="space-y-3">
              {layers.map((layer, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-[130px]">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white uppercase text-[11px]">
                      {layer.type === 'flute' ? `Flute (${layer.takeUpFactor}x)` : layer.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Paper Type */}
                  <div className="w-24">
                    <select
                      value={layer.paperType}
                      onChange={(e) => updateLayer(idx, 'paperType', e.target.value)}
                      className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-bold"
                    >
                      <option value="K">K (Kraft)</option>
                      <option value="M">M (Medium)</option>
                      <option value="WK">WK (White)</option>
                      <option value="TL">TL (Test)</option>
                      <option value="D">D (Duplex)</option>
                    </select>
                  </div>

                  {/* GSM */}
                  <div className="w-20">
                    <input
                      type="number"
                      value={layer.gsm || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateLayer(idx, 'gsm', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs text-center font-bold"
                      placeholder="GSM"
                    />
                  </div>

                  {/* Price per Kg */}
                  <div className="w-32">
                    <input
                      type="number"
                      value={layer.pricePerKg || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateLayer(idx, 'pricePerKg', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-full py-1.5 px-2 rounded-lg bloomberg-input text-xs font-bold text-amber-300 text-right"
                      placeholder="Rp/kg"
                    />
                  </div>

                  {/* Layer cost preview */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-xs font-bold text-white">
                      {formatCurrency(((layer.gsm * layer.takeUpFactor) / 1000) * layer.pricePerKg)}
                    </div>
                    <div className="text-[9px] text-muted-foreground">/ m²</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Overheads & Margins */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2 border-b border-white/10 pb-3">
              <Percent className="w-4 h-4" /> 3. Biaya Produksi, Waste & Target Margin
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Biaya Lem / m²</label>
                <input
                  type="number"
                  value={glueCostPerM2 || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setGlueCostPerM2(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold"
                  placeholder="250"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Ongkos Mesin / m²</label>
                <input
                  type="number"
                  value={convertingCostPerM2 || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setConvertingCostPerM2(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold"
                  placeholder="550"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Waste (%)</label>
                <input
                  type="number"
                  value={wastePercent || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setWastePercent(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold text-center"
                  placeholder="5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono">Target Margin (%)</label>
                <input
                  type="number"
                  value={marginPercent || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setMarginPercent(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 rounded-xl bloomberg-input text-xs font-mono font-bold text-amber-400 text-center"
                  placeholder="18"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Dashboard: Cost Breakdown & Profit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selling Price & Profit Highlight */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900/50 to-slate-950 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase font-mono tracking-widest">
                REKOMENDASI HARGA JUAL / PCS
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Margin {marginPercent}%
              </span>
            </div>

            <div className="text-4xl md:text-5xl font-black text-amber-400 font-mono tracking-tight">
              {formatCurrency(result.sellingPricePerSheet)}
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-mono">HPP Dasar / Sheet</div>
                <div className="text-lg font-bold text-white font-mono">
                  {formatCurrency(result.totalCostPerSheet)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Estimasi Total Profit</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {formatCurrency(result.totalProfit)}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Cost Breakdown Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="text-xs font-black text-white uppercase font-mono tracking-widest flex items-center gap-2 border-b border-white/10 pb-3">
              <PieChart className="w-4 h-4 text-amber-400" /> Rincian Komponen Biaya (HPP)
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-300">Biaya Kertas Mentah (Raw Paper)</span>
                <span className="font-bold text-white">{formatCurrency(result.rawPaperCostPerM2)} / m²</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-300">Biaya Lem Tapioka/Starch</span>
                <span className="font-bold text-white">{formatCurrency(result.glueCostPerM2)} / m²</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-300">Biaya Mesin Corrugator & Listrik</span>
                <span className="font-bold text-white">{formatCurrency(result.convertingCostPerM2)} / m²</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-300">Penyisihan Waste ({wastePercent}%)</span>
                <span className="font-bold text-amber-300">{formatCurrency(result.wasteCostPerM2)} / m²</span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-white/10 text-sm font-bold">
                <span className="text-amber-400">TOTAL HPP PRODUKSI / M²</span>
                <span className="text-amber-400">{formatCurrency(result.totalCostPerM2)}</span>
              </div>
            </div>

            {/* Total Order Summary */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Total Omzet ({quantity.toLocaleString()} pcs)</span>
                <span className="text-white font-bold">{formatCurrency(result.totalOrderValue)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Total Modal (HPP Total)</span>
                <span className="text-slate-300">{formatCurrency(result.totalCostPerSheet * quantity)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-emerald-400 border-t border-white/10 pt-1.5">
                <span>Nett Profit Bersih</span>
                <span>{formatCurrency(result.totalProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
