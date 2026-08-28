import React from 'react';
import { 
  Calculator, 
  Package, 
  Table, 
  Weight, 
  Terminal, 
  Box, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Layers, 
  TrendingUp, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface DashboardOverviewProps {
  onSelectModule: (moduleId: string) => void;
}

export function DashboardOverview({ onSelectModule }: DashboardOverviewProps) {
  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-900/50 to-slate-950">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-5 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase font-mono">
              <Zap className="w-3.5 h-3.5" /> High-Performance Carton Engine
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white font-mono leading-none">
              VINNS <span className="text-amber-400">CARTON</span><br />
              <span className="text-slate-200">CALCULATOR PRO</span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans">
              Solusi perhitungan presisi tinggi untuk industri kemasan karton box (Corrugated Carton Sheet). 
              Mendukung kalkulasi harga instan, MOQ corrugator, tonase logistik, konversi dimensi box 3D ke sheet blank, serta simulasi biaya custom paper.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectModule('price')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wider uppercase font-mono shadow-lg shadow-amber-500/25 transition-all"
              >
                <Calculator className="w-4 h-4" /> Buka Price Calc
              </button>
              <button
                onClick={() => onSelectModule('box-converter')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs tracking-wider uppercase font-mono border border-amber-500/30 transition-all"
              >
                <Box className="w-4 h-4 text-amber-400" /> Box to Sheet Conv
              </button>
              <button
                onClick={() => onSelectModule('cost-simulator')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs tracking-wider uppercase font-mono border border-white/10 transition-all"
              >
                <Cpu className="w-4 h-4 text-amber-400" /> Custom Cost Sim
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center p-8 rounded-2xl glass-panel border border-amber-500/30 bg-black/40 text-center w-72 space-y-4">
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
              <Layers className="w-12 h-12" />
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">194+</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Substance Pricelist</div>
            </div>
            <div className="w-full h-px bg-white/10" />
            <div>
              <div className="text-2xl font-black text-amber-400 font-mono">331</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Artikel Terdaftar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-mono tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> SEMUA MODUL KALKULATOR
          </h2>
          <span className="text-xs text-muted-foreground font-mono">8 Modul Aktif</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Articles */}
          <ModuleCard
            title="Dataset Explorer"
            code="DATASET"
            desc="Katalog spesifikasi ribuan artikel karton lengkap dengan dimensi PxL dan substance."
            icon={Table}
            onClick={() => onSelectModule('articles')}
          />

          {/* 2. Price Calc */}
          <ModuleCard
            title="Price Calculator"
            code="PRICE.CALC"
            desc="Hitung harga jual lembaran multi-baris otomatis dengan diskon, MOQ, dan tonase."
            icon={Calculator}
            onClick={() => onSelectModule('price')}
          />

          {/* 3. MOQ Calc */}
          <ModuleCard
            title="MOQ Calculator"
            code="MOQ.CALC"
            desc="Kalkulasi Minimum Order Corrugator roll 2480mm dan jumlah Out potong mesin."
            icon={Package}
            onClick={() => onSelectModule('moq')}
          />

          {/* 4. Tonnage Calc */}
          <ModuleCard
            title="Weight & Tonnage"
            code="WEIGHT.CALC"
            desc="Analisis total tonase dan estimasi muatan armada logistik pabrik (FSK / Fuso / Fuso Ori / Wingbox)."
            icon={Weight}
            onClick={() => onSelectModule('tonnage')}
          />

          {/* 5. God Mode */}
          <ModuleCard
            title="God Mode Terminal"
            code="GOD.MODE"
            desc="Kalkulator All-in-One komprehensif: Harga, MOQ, Tonase, Gramatur & Berat per Lembar."
            icon={Terminal}
            onClick={() => onSelectModule('god-mode')}
          />

          {/* 6. Box to Sheet Converter - Special */}
          <ModuleCard
            title="Box to Sheet Converter"
            code="BOX.CONV"
            desc="Konversi dimensi Box 3D (PxLxT) ke lembaran flat blank (RSC/FOL/Die-cut/Top-Bottom)."
            icon={Box}
            highlight
            badge="NEW SPECIAL"
            onClick={() => onSelectModule('box-converter')}
          />

          {/* 7. Custom Cost Simulator - Special */}
          <ModuleCard
            title="Custom Cost Simulator"
            code="COST.SIM"
            desc="Simulasi biaya bahan baku kertas per lapis, biaya lem, konversi mesin, margin & waste."
            icon={Cpu}
            highlight
            badge="NEW SPECIAL"
            onClick={() => onSelectModule('cost-simulator')}
          />

          {/* 8. Quick Specs Info */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest">
                STANDAR INDUSTRI
              </div>
              <h3 className="text-base font-bold text-white font-mono">Faktor Flute Corrugated</h3>
              <p className="text-xs text-muted-foreground">
                B-Flute: 1.35x | C-Flute: 1.43x | E-Flute: 1.25x | Corrugator Max Width: 2.480 mm.
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                <CheckCircle2 className="w-4 h-4" /> Formula Teruji
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModuleCardProps {
  title: string;
  code: string;
  desc: string;
  icon: React.ElementType;
  highlight?: boolean;
  badge?: string;
  onClick: () => void;
}

function ModuleCard({ title, code, desc, icon: Icon, highlight, badge, onClick }: ModuleCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-2xl p-6 glass-panel transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden ${
        highlight
          ? 'border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10'
          : 'hover:border-amber-500/40 hover:bg-white/5'
      }`}
    >
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-xl border transition-all duration-300 ${
              highlight
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 group-hover:bg-amber-500 group-hover:text-black'
                : 'bg-white/5 text-amber-400 border-white/10 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest font-mono">
              {badge}
            </span>
          )}
        </div>

        <div>
          <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
            {code}
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors font-mono">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-sans">
            {desc}
          </p>
        </div>
      </div>

      <div className="pt-6 flex items-center justify-between text-xs font-mono font-bold text-amber-400 uppercase tracking-wider relative z-10">
        <span>Buka Modul</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
      </div>
    </div>
  );
}
