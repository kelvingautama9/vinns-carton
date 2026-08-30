import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Mail, 
  MessageSquare, 
  FileText, 
  Table, 
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Layers,
  Truck
} from 'lucide-react';
import { 
  SummaryExportData, 
  generateWhatsAppSnippet, 
  generateEmailFormat, 
  generateSummaryCSV, 
  generateSummaryText, 
  downloadFile,
  getOrCalculateFleetAnalysis
} from '../../lib/summaryExport';

interface DownloadSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SummaryExportData;
}

export function DownloadSummaryModal({ isOpen, onClose, data }: DownloadSummaryModalProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'text' | 'csv'>('whatsapp');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const fleet = useMemo(() => getOrCalculateFleetAnalysis(data), [data]);
  const whatsappSnippet = useMemo(() => generateWhatsAppSnippet(data), [data]);
  const emailFormat = useMemo(() => generateEmailFormat(data), [data]);
  const textSummary = useMemo(() => generateSummaryText(data), [data]);
  const csvSummary = useMemo(() => generateSummaryCSV(data), [data]);

  if (!isOpen) return null;

  const handleCopy = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadTxt = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(textSummary, `Ringkasan_Kalkulasi_Karton_${timestamp}.txt`, 'text/plain;charset=utf-8');
  };

  const handleDownloadCsv = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(csvSummary, `Laporan_Kalkulasi_Karton_${timestamp}.csv`, 'text/csv;charset=utf-8');
  };

  const handleDownloadWhatsAppTxt = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(whatsappSnippet, `WhatsApp_Snippet_${timestamp}.txt`, 'text/plain;charset=utf-8');
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappSnippet);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEmail = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailFormat.subject)}&body=${encodeURIComponent(emailFormat.body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden glass-panel">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono tracking-wide">
                  DOWNLOAD & BAGIKAN RINGKASAN
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {data.items.length} ITEM
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Format siap bagikan via WhatsApp, Email, atau unduh sebagai file .TXT & .CSV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Summary Highlights Strip */}
        <div className="px-6 py-3 bg-black/40 border-b border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-muted-foreground">Tonase:</span>
              <strong className="text-white font-mono">{data.totalTons.toFixed(4)} Ton</strong>
              <span className="text-slate-400 font-mono">({data.totalKg.toLocaleString('id-ID')} kg)</span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
              <span className="text-muted-foreground">Total Qty:</span>
              <strong className="text-white font-mono">{data.totalPcs.toLocaleString('id-ID')} pcs</strong>
            </div>

            {fleet.isBelowMinimumDelivery ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Min. Kirim Kurang +{fleet.minimumShortageKg.toLocaleString('id-ID')} kg</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                <Truck className="w-3.5 h-3.5" />
                <span>{fleet.recommendedFleet ? `${fleet.recommendedFleet.name} (${fleet.recommendedFleet.truckDisplay})` : 'Optimal'}</span>
              </div>
            )}
          </div>

          {/* Quick Direct Download Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Unduh .TXT</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
            >
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unduh .CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-white/10 bg-white/5 shrink-0 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'whatsapp'
                ? 'bg-black/40 text-emerald-400 border-emerald-400 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Format WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'email'
                ? 'bg-black/40 text-sky-400 border-sky-400 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Format Email</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'text'
                ? 'bg-black/40 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rincian Teks (.TXT)</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'csv'
                ? 'bg-black/40 text-purple-400 border-purple-400 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Data Spreadsheet (.CSV)</span>
          </button>
        </div>

        {/* Tab Content & Live Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    Format Siap Kirim WhatsApp (Lengkap Dimensi, Tonase & Armada)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Format rapi dengan tebal (*bold*), emoji terstruktur, dan peringatan kekurangan muatan otomatis.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(whatsappSnippet, 'wa')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all shadow-sm"
                  >
                    {copiedTab === 'wa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTab === 'wa' ? 'Tersalin!' : 'Salin Teks WhatsApp'}</span>
                  </button>

                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-100 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto shadow-inner select-all">
                {whatsappSnippet}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-sky-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    Format Email Resmi Logistik & Penjualan
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Lengkap dengan baris Subject email terstandar dan pesan terstruktur.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(`Subject: ${emailFormat.subject}\n\n${emailFormat.body}`, 'email')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-all shadow-sm"
                  >
                    {copiedTab === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTab === 'email' ? 'Tersalin!' : 'Salin Format Email'}</span>
                  </button>

                  <button
                    onClick={handleOpenEmail}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Aplikasi Email</span>
                  </button>
                </div>
              </div>

              {/* Subject Display */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 font-mono">Subject Email:</span>
                <p className="text-xs font-mono font-bold text-white select-all">{emailFormat.subject}</p>
              </div>

              {/* Body Display */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-sky-100 whitespace-pre-wrap leading-relaxed max-h-[320px] overflow-y-auto shadow-inner select-all">
                {emailFormat.body}
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Format Laporan Teks Rinci (.TXT)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Dokumen teks bersih untuk pencetakan, nota internal, atau arsip kalkulasi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(textSummary, 'txt')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all shadow-sm"
                  >
                    {copiedTab === 'txt' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTab === 'txt' ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-md font-black"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .TXT</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-amber-100 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto shadow-inner select-all">
                {textSummary}
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-purple-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Table className="w-4 h-4" />
                    Data Spreadsheet Kompatibel (.CSV)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Bisa langsung dibuka di Microsoft Excel, Google Sheets, atau sistem ERP.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(csvSummary, 'csv')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all shadow-sm"
                  >
                    {copiedTab === 'csv' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTab === 'csv' ? 'Tersalin!' : 'Salin CSV'}</span>
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .CSV</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-purple-100 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto shadow-inner select-all">
                {csvSummary}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 shrink-0 bg-white/5">
          <div className="text-[11px] text-muted-foreground font-mono">
            Vinns Corrugated Calculation Summary Export • Standar Armada Pabrik (FSK, FUSO, FUSO ORI, WINGBOX)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleDownloadTxt}
              className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-md font-black flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Ringkasan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
