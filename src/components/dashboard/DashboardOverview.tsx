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
  CheckCircle2,
  ExternalLink,
  Linkedin,
  Instagram,
  Github
} from 'lucide-react';

interface DashboardOverviewProps {
  onSelectModule: (moduleId: string) => void;
}

export function DashboardOverview({ onSelectModule }: DashboardOverviewProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Compact Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-5 sm:p-7 border border-[var(--border-color)]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-mono text-[var(--text-main)]">
              VINNS <span className="text-[var(--text-accent)]">CARTON</span> CALC
            </h1>

            {/* Social Contact Links */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[var(--text-muted)] font-mono font-semibold mr-1">Contact:</span>
              
              <a
                href="https://www.linkedin.com/in/kelvin-vinns"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-mono font-bold transition-all hover:scale-105"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href="https://www.instagram.com/kelvingautama9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600/10 hover:bg-pink-600/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 text-xs font-mono font-bold transition-all hover:scale-105"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href="https://github.com/kelvingautama9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-[var(--text-main)] border border-[var(--border-color)] text-xs font-mono font-bold transition-all hover:scale-105"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => onSelectModule('price')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-btn-bg)] hover:brightness-110 text-[var(--accent-btn-text)] font-black text-xs uppercase font-mono shadow-md transition-all active:scale-95"
              >
                <Calculator className="w-3.5 h-3.5" /> Price Calc
              </button>
              <button
                onClick={() => onSelectModule('box-converter')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-active)] text-[var(--text-main)] font-bold text-xs uppercase font-mono border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all active:scale-95"
              >
                <Box className="w-3.5 h-3.5 text-[var(--text-accent)]" /> Box to Sheet
              </button>
              <button
                onClick={() => onSelectModule('cost-simulator')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-active)] text-[var(--text-main)] font-bold text-xs uppercase font-mono border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all active:scale-95"
              >
                <Cpu className="w-3.5 h-3.5 text-[var(--text-accent)]" /> Cost Sim
              </button>
            </div>
          </div>

          {/* Mini Counter Stats */}
          <div className="flex sm:flex-row md:flex-col items-center gap-4 p-4 rounded-xl glass-panel border border-[var(--border-color)] w-full sm:w-auto min-w-[180px] justify-around">
            <div className="text-center">
              <div className="text-2xl font-black text-[var(--text-main)] font-mono">194+</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Substances</div>
            </div>
            <div className="hidden sm:block w-px md:w-full md:h-px bg-[var(--border-color)]" />
            <div className="text-center">
              <div className="text-2xl font-black text-[var(--text-accent)] font-mono">331</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Artikel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[var(--text-main)] font-mono tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)]" /> MODUL KALKULASI
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-mono font-medium">8 Modul Siap Pakai</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Articles */}
          <ModuleCard
            title="Dataset Explorer"
            code="DATASET"
            desc="Katalog spesifikasi 331+ artikel karton lengkap dengan dimensi PxL dan substance."
            icon={Table}
            onClick={() => onSelectModule('articles')}
          />

          {/* 2. Price Calc */}
          <ModuleCard
            title="Price Calculator"
            code="PRICE.CALC"
            desc="Hitung harga jual sheet multi-baris otomatis dengan diskon, MOQ, dan tonase."
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
            desc="Analisis total tonase dan estimasi muatan armada logistik (FSK, Fuso, Wingbox)."
            icon={Weight}
            onClick={() => onSelectModule('tonnage')}
          />

          {/* 5. God Mode */}
          <ModuleCard
            title="God Mode Terminal"
            code="GOD.MODE"
            desc="Kalkulator All-in-One: Harga, MOQ, Tonase, Gramatur & Berat per Lembar."
            icon={Terminal}
            onClick={() => onSelectModule('god-mode')}
          />

          {/* 6. Box to Sheet Converter */}
          <ModuleCard
            title="Box to Sheet Converter"
            code="BOX.CONV"
            desc="Konversi dimensi Box 3D (PxLxT) ke lembaran flat blank (RSC, FOL, Die-cut)."
            icon={Box}
            highlight
            badge="SPECIAL"
            onClick={() => onSelectModule('box-converter')}
          />

          {/* 7. Custom Cost Simulator */}
          <ModuleCard
            title="Custom Cost Simulator"
            code="COST.SIM"
            desc="Simulasi biaya bahan baku kertas per lapis, biaya lem, konversi mesin, margin & waste."
            icon={Cpu}
            highlight
            badge="SPECIAL"
            onClick={() => onSelectModule('cost-simulator')}
          />

          {/* 8. Quick Specs Info */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[var(--border-color)] flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="text-[10px] font-black text-[var(--text-accent)] uppercase font-mono tracking-widest">
                STANDAR FLUTE
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)] font-mono">Faktor Corrugator</h3>
              <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
                B: 1.35 | C: 1.43 | E: 1.25<br />
                Max Lebar Roll: 2.480 mm
              </p>
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Formula Standar
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
      className={`group cursor-pointer rounded-2xl p-4 sm:p-5 glass-panel transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden ${
        highlight
          ? 'border-[var(--accent-color)]/50 hover:border-[var(--accent-color)] bg-[var(--bg-active)]'
          : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/70'
      }`}
    >
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div
            className={`p-2.5 rounded-xl border transition-all duration-200 ${
              highlight
                ? 'bg-[var(--accent-btn-bg)] text-[var(--accent-btn-text)] border-[var(--accent-color)]/40'
                : 'bg-[var(--bg-input)] text-[var(--text-accent)] border-[var(--border-color)] group-hover:bg-[var(--accent-btn-bg)] group-hover:text-[var(--accent-btn-text)]'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-[var(--bg-active)] text-[var(--text-accent)] border border-[var(--border-color)] uppercase tracking-widest font-mono">
              {badge}
            </span>
          )}
        </div>

        <div>
          <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">
            {code}
          </div>
          <h3 className="text-base font-bold text-[var(--text-main)] tracking-tight group-hover:text-[var(--text-accent)] transition-colors font-mono">
            {title}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed font-sans">
            {desc}
          </p>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between text-xs font-mono font-bold text-[var(--text-accent)] uppercase tracking-wider relative z-10">
        <span>Buka Modul</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
