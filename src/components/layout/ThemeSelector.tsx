import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, Moon, Sun, Droplets, Coffee } from 'lucide-react';
import { useAppTheme, AppTheme } from '../../context/ThemeContext';

interface ThemeOption {
  id: AppTheme;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  previewClass: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'default',
    label: 'Default Dark',
    sublabel: 'Bloomberg Amber',
    icon: Moon,
    previewClass: 'bg-[#0b0f19] border-amber-500/50 text-amber-400',
  },
  {
    id: 'liquid-glass',
    label: 'Liquid Glass',
    sublabel: 'iOS Dynamic Blur',
    icon: Droplets,
    previewClass: 'bg-slate-900/60 border-cyan-400/50 text-cyan-400',
  },
  {
    id: 'light-white',
    label: 'Light White',
    sublabel: 'Clean High-Contrast',
    icon: Sun,
    previewClass: 'bg-slate-100 border-slate-300 text-slate-800',
  },
  {
    id: 'beige',
    label: 'Beige Editorial',
    sublabel: 'Warm Organic Linen',
    icon: Coffee,
    previewClass: 'bg-[#f5f0e8] border-[#d6ccb8] text-[#78350f]',
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 glass-panel hover:border-amber-400/40 text-xs font-mono font-bold transition-all"
        title="Ganti Tema Tampilan"
      >
        <Palette className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline font-sans font-semibold text-[11px]">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl glass-panel border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-white/10 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground tracking-wider">
              Pilih Tema (Theme)
            </span>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${opt.previewClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground">{opt.sublabel}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
