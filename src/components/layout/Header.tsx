import React from 'react';
import { Activity, ShieldCheck, Github, Sparkles, Layers, Box, Cpu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { label: 'DASHBOARD SYSTEM', desc: 'Main Terminal & Metrics Overview' };
      case 'articles':
        return { label: 'ARTICLE DATASET', desc: 'Master Corrugated Box Specification Explorer' };
      case 'price':
        return { label: 'PRICE CALCULATOR', desc: 'Multi-item Sheet Pricing & Quotation Generator' };
      case 'moq':
        return { label: 'MOQ CALCULATOR', desc: 'Corrugator Run Minimum Order & Out Estimator' };
      case 'tonnage':
        return { label: 'WEIGHT & TONNAGE', desc: 'Payload, GSM Breakdown & Logistic Capacity' };
      case 'god-mode':
        return { label: 'GOD MODE TERMINAL', desc: 'Unified Deep Single-Item Calculation Suite' };
      case 'box-converter':
        return { label: 'BOX TO SHEET CONVERTER', desc: '3D Box Dimensions to Flat Creasing Blank Converter' };
      case 'cost-simulator':
        return { label: 'CUSTOM COST SIMULATOR', desc: 'Paper Buildup, Converting, Waste & Margin Breakdown' };
      default:
        return { label: 'VINNS CALCULATOR', desc: 'Corrugated Carton Engine' };
    }
  };

  const info = getTabTitle();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/10 glass-panel">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black tracking-wider text-white font-mono">{info.label}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono uppercase tracking-widest">
              v2.5 PRO
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{info.desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">LIVE CALC ENGINE</span>
          <span className="text-white/20">|</span>
          <span className="text-muted-foreground">194 SUBSTANCES</span>
        </div>

        <a
          href="https://github.com/kelvingautama9/carton-sheet-calc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-amber-500/40 transition-all duration-300"
          title="Open GitHub Repository"
        >
          <Github className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">GitHub Repo</span>
        </a>
      </div>
    </header>
  );
}
