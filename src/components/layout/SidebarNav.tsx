import React from 'react';
import { 
  Home, 
  Table, 
  Calculator, 
  Package, 
  Weight, 
  Terminal, 
  Box, 
  Cpu, 
  Sparkles,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: Home, badge: '' },
  { id: 'articles', label: 'DATASET', icon: Table, badge: '331' },
  { id: 'price', label: 'PRICE.CALC', icon: Calculator, badge: '' },
  { id: 'moq', label: 'MOQ.CALC', icon: Package, badge: '' },
  { id: 'tonnage', label: 'WEIGHT.CALC', icon: Weight, badge: '' },
  { id: 'god-mode', label: 'GOD.MODE', icon: Terminal, badge: 'AIO' },
  { id: 'box-converter', label: 'BOX.CONV', icon: Box, badge: 'NEW', highlight: true },
  { id: 'cost-simulator', label: 'COST.SIM', icon: Cpu, badge: 'NEW', highlight: true },
];

export function SidebarNav({ activeTab, onTabChange, isOpenMobile, onCloseMobile }: SidebarNavProps) {
  return (
    <aside className="w-64 flex flex-col justify-between h-full bg-[#080d1a] border-r border-white/10 p-4 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base tracking-wider font-mono">VINNS</span>
              <span className="font-black text-amber-400 text-base tracking-wider font-mono">CARTON</span>
            </div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.25em]">
              Sheet & Box Suite
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.25em]">
            Core Modules
          </div>
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-200 group text-left',
                  isActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-black' : 'text-amber-400')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-widest',
                      isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-black uppercase text-amber-400/80 tracking-[0.25em] flex items-center justify-between">
            <span>Special Modules</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
          {navItems.slice(6).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-200 group text-left relative overflow-hidden',
                  isActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black'
                    : 'text-slate-300 hover:text-white bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-black' : 'text-amber-400')} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-widest uppercase',
                    isActive ? 'bg-black/20 text-black' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  )}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Terminal Footer */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>ENGINE STATUS</span>
            <span className="text-emerald-400 font-bold">READY</span>
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full w-full rounded-full" />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">
            Fast Corrugated Calculation
          </p>
        </div>
      </div>
    </aside>
  );
}
