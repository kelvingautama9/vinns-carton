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
  ExternalLink
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

export function SidebarNav({ activeTab, onTabChange, onCloseMobile }: SidebarNavProps) {
  return (
    <aside className="w-60 lg:w-64 flex flex-col justify-between h-full bg-[var(--bg-sidebar)] border-r border-white/10 p-3.5 select-none transition-colors duration-200">
      <div className="space-y-4">
        {/* Brand Header */}
        <div 
          onClick={() => onTabChange('dashboard')} 
          className="flex items-center gap-2.5 px-2 py-2 cursor-pointer border-b border-white/10 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-white text-sm tracking-wider font-mono">VINNS</span>
              <span className="font-black text-amber-400 text-sm tracking-wider font-mono">CARTON</span>
            </div>
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest font-mono">
              v2.5 PRO
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="px-2 pb-1 text-[9px] font-black uppercase text-muted-foreground/70 tracking-widest font-mono">
            Modul Utama
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
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-150 group text-left',
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-black' : 'text-amber-400')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded text-[8px] font-extrabold tracking-widest',
                      isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 px-2 pb-1 text-[9px] font-black uppercase text-amber-400/80 tracking-widest font-mono flex items-center justify-between">
            <span>Special Tool</span>
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
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-150 group text-left relative overflow-hidden',
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-300 hover:text-white bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-black' : 'text-amber-400')} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded text-[8px] font-extrabold tracking-widest uppercase',
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

      {/* Footer Contact */}
      <div className="pt-3 border-t border-white/10 space-y-2 text-[10px] font-mono">
        <div className="flex items-center justify-between text-muted-foreground px-1">
          <span>Kelvin Gautama</span>
          <a
            href="https://www.linkedin.com/in/kelvin-vinns"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline flex items-center gap-0.5"
          >
            LinkedIn <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </aside>
  );
}
