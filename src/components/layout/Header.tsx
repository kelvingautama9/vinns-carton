import React from 'react';
import { Github } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab }: HeaderProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { label: 'DASHBOARD', desc: 'Ringkasan & Modul Kalkulasi' };
      case 'articles':
        return { label: 'DATASET', desc: 'Katalog Spesifikasi Sheet Box' };
      case 'price':
        return { label: 'PRICE.CALC', desc: 'Kalkulasi Harga Lembaran Sheet' };
      case 'moq':
        return { label: 'MOQ.CALC', desc: 'Hitung Minimum Order & Out Mesin' };
      case 'tonnage':
        return { label: 'WEIGHT.CALC', desc: 'Tonase & Estimasi Armada Pengiriman' };
      case 'god-mode':
        return { label: 'GOD.MODE', desc: 'Kalkulator Komprehensif All-in-One' };
      case 'box-converter':
        return { label: 'BOX.CONV', desc: 'Konversi Box 3D ke Lembaran Flat Blank' };
      case 'cost-simulator':
        return { label: 'COST.SIM', desc: 'Simulasi Struktur Biaya & Custom Paper' };
      default:
        return { label: 'VINNS CALC', desc: 'Corrugated Engine' };
    }
  };

  const info = getTabTitle();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-3 border-b border-white/10 glass-panel">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black tracking-wider text-white font-mono">{info.label}</h2>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono uppercase tracking-widest">
              v2.5
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:block">{info.desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Engine Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">READY</span>
          <span className="text-white/20">|</span>
          <span className="text-muted-foreground">194 SUBSTANCES</span>
        </div>

        {/* Theme Selector */}
        <ThemeSelector />

        {/* GitHub Shortcut */}
        <a
          href="https://github.com/kelvingautama9"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-amber-500/40 transition-all"
          title="GitHub kelvingautama9"
        >
          <Github className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline font-mono text-[11px]">GitHub</span>
        </a>
      </div>
    </header>
  );
}
