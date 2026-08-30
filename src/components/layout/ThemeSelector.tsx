import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Moon, Sun, Droplets, Sparkles } from 'lucide-react';
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
    label: 'Light Glass',
    sublabel: 'Glassmorphism & Pink',
    icon: Sun,
    previewClass: 'bg-white border-[#BFC5D2] text-[#2F3440]',
  },
  {
    id: 'beige',
    label: 'Luxe Beige',
    sublabel: 'Cream & Wine Burgundy',
    icon: Sparkles,
    previewClass: 'bg-[#EFE9E1] border-[#AC9C8D] text-[#72383D]',
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-color)] glass-panel hover:border-[var(--accent-color)] text-xs font-mono font-bold transition-all text-[var(--text-main)]"
        title="Ganti Tema Tampilan"
      >
        <Palette className="w-3.5 h-3.5 text-[var(--text-accent)]" />
        <span className="hidden sm:inline font-sans font-semibold text-[11px]">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 p-2 rounded-2xl glass-panel border border-[var(--border-color)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 bg-[var(--bg-panel-solid)]">
          <div className="px-3 py-1.5 border-b border-[var(--border-color)] mb-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-muted)] tracking-wider">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-[var(--bg-active)] text-[var(--text-accent)] font-bold border border-[var(--accent-color)]/40'
                      : 'hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${opt.previewClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-main)]">{opt.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{opt.sublabel}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[var(--text-accent)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
