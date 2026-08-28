import React, { useState } from 'react';
import { ClipboardPaste, AlertCircle, Check, X } from 'lucide-react';
import { normalizeSubstance } from '../../lib/calculations';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'price' | 'moq' | 'tonnage';
  onImport: (rows: any[]) => void;
}

export function BulkPasteModal({ isOpen, onClose, mode, onImport }: BulkPasteModalProps) {
  const [rawText, setRawText] = useState('');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setRawText(text);
    setError(null);
    if (!text.trim()) {
      setPreviewRows([]);
      return;
    }

    try {
      const lines = text.trim().split(/\r?\n/);
      const parsed: any[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by tabs or multiple spaces or commas
        const cols = line.includes('\t')
          ? line.split('\t').map(c => c.trim())
          : line.includes(',')
          ? line.split(',').map(c => c.trim())
          : line.split(/\s{2,}|\s+/).map(c => c.trim());

        if (mode === 'moq') {
          // Expects Panjang, Lebar
          const panjang = parseFloat(cols[0]?.replace(/[^0-9.]/g, '') || '0');
          const lebar = parseFloat(cols[1]?.replace(/[^0-9.]/g, '') || '0');
          if (panjang > 0 && lebar > 0) {
            parsed.push({
              id: `moq_${Date.now()}_${i}`,
              panjang,
              lebar,
            });
          }
        } else if (mode === 'price') {
          // Expects Panjang, Lebar, Substance?, Flute?, Diskon?
          const panjang = parseFloat(cols[0]?.replace(/[^0-9.]/g, '') || '0');
          const lebar = parseFloat(cols[1]?.replace(/[^0-9.]/g, '') || '0');
          const substance = cols[2] ? normalizeSubstance(cols[2]) : 'K125/M125/K125';
          let flute = cols[3]?.toUpperCase() || 'B';
          if (!['B', 'C', 'BC', 'E'].includes(flute)) flute = 'B';
          const diskon = cols[4] ? parseFloat(cols[4].replace(/[^0-9.]/g, '') || '0') : 0;

          if (panjang > 0 && lebar > 0) {
            parsed.push({
              id: `price_${Date.now()}_${i}`,
              panjang,
              lebar,
              substance: substance || 'K125/M125/K125',
              flute,
              diskon,
            });
          }
        } else if (mode === 'tonnage') {
          // Expects Panjang, Lebar, Substance?, Flute?, Quantity?
          const panjang = parseFloat(cols[0]?.replace(/[^0-9.]/g, '') || '0');
          const lebar = parseFloat(cols[1]?.replace(/[^0-9.]/g, '') || '0');
          const substance = cols[2] ? normalizeSubstance(cols[2]) : 'M100/M100/M100';
          let flute = cols[3]?.toUpperCase() || 'B';
          if (!['B', 'C', 'BC', 'E'].includes(flute)) flute = 'B';
          const quantity = cols[4] ? parseFloat(cols[4].replace(/[^0-9.]/g, '') || '0') : 1000;

          if (panjang > 0 && lebar > 0) {
            parsed.push({
              id: `tonnage_${Date.now()}_${i}`,
              panjang,
              lebar,
              substance: substance || 'M100/M100/M100',
              flute,
              quantity: quantity || 1000,
            });
          }
        }
      }

      if (parsed.length === 0) {
        setError('Tidak ada data valid yang dapat diproses. Pastikan format kolom sesuai.');
      } else {
        setPreviewRows(parsed);
      }
    } catch (e: any) {
      setError(`Gagal mem-parsing teks: ${e?.message || 'Format tidak valid'}`);
    }
  };

  const handleConfirmImport = () => {
    if (previewRows.length > 0) {
      onImport(previewRows);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 space-y-5 border border-amber-500/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">Paste dari Excel / Spreadsheet</h3>
              <p className="text-xs text-muted-foreground">
                {mode === 'price' && 'Format kolom: Panjang | Lebar | Substance | Flute | Diskon(%)'}
                {mode === 'moq' && 'Format kolom: Panjang | Lebar'}
                {mode === 'tonnage' && 'Format kolom: Panjang | Lebar | Substance | Flute | Quantity'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Paste Data Tabular Disini (Ctrl + V)
          </label>
          <textarea
            value={rawText}
            onChange={(e) => handleParse(e.target.value)}
            placeholder={
              mode === 'price'
                ? "Contoh:\n1000\t800\tK125/M125/K125\tB\t5\n1200\t950\tM100/M100/M100\tC\t0"
                : mode === 'moq'
                ? "Contoh:\n1000\t800\n1200\t950"
                : "Contoh:\n1000\t800\tK125/M125/K125\tB\t2500\n1200\t950\tM100/M100/M100\tC\t5000"
            }
            rows={5}
            className="w-full bloomberg-input rounded-xl p-3 text-xs font-mono resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {previewRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Pratinjau Data ({previewRows.length} baris terdeteksi):
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-2 font-mono text-xs divide-y divide-white/5">
              {previewRows.slice(0, 10).map((row, idx) => (
                <div key={idx} className="py-1 flex items-center justify-between text-slate-300">
                  <span>
                    #{idx + 1} - {row.panjang} x {row.lebar} mm
                  </span>
                  <span className="text-amber-400">
                    {row.substance ? `${row.substance} (${row.flute})` : ''}
                    {row.quantity ? ` - ${row.quantity} pcs` : ''}
                    {row.diskon ? ` - Disc ${row.diskon}%` : ''}
                  </span>
                </div>
              ))}
              {previewRows.length > 10 && (
                <div className="py-1 text-center text-muted-foreground text-[11px] italic">
                  ... dan {previewRows.length - 10} baris lainnya
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-white/5 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={previewRows.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Check className="w-4 h-4" />
            Import {previewRows.length} Baris
          </button>
        </div>
      </div>
    </div>
  );
}
