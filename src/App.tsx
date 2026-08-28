import React, { useState } from 'react';
import { SidebarNav } from './components/layout/SidebarNav';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ArticleExplorer } from './components/articles/ArticleExplorer';
import { PriceCalculator } from './components/calculators/PriceCalculator';
import { MoqCalculator } from './components/calculators/MoqCalculator';
import { TonnageCalculator } from './components/calculators/TonnageCalculator';
import { GodModeCalculator } from './components/calculators/GodModeCalculator';
import { BoxConverter } from './components/calculators/BoxConverter';
import { CostSimulator } from './components/calculators/CostSimulator';
import { Article, PriceRow, TonnageRow } from './types';
import { Menu, X, Box } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // State to pass to individual calculators when sent from dataset / other tools
  const [passedPriceRows, setPassedPriceRows] = useState<PriceRow[] | undefined>(undefined);
  const [passedTonnageRows, setPassedTonnageRows] = useState<TonnageRow[] | undefined>(undefined);
  const [passedGodModeValues, setPassedGodModeValues] = useState<{
    panjang: number;
    lebar: number;
    substance: string;
    flute: string;
    diskon?: number;
    quantity?: number;
  } | undefined>(undefined);

  // Handler for sending article to specific calculator
  const handleUseArticle = (article: Article, targetTab: 'price' | 'god-mode' | 'tonnage') => {
    const parts = article.ukuran.toLowerCase().split('x').map((s) => parseFloat(s.trim()) || 0);
    const p = parts[0] || 1000;
    const l = parts[1] || 800;

    if (targetTab === 'price') {
      setPassedPriceRows([
        {
          id: `row_${Date.now()}_article`,
          panjang: p,
          lebar: l,
          substance: article.substance,
          flute: article.flute,
          diskon: 0,
        },
      ]);
      setActiveTab('price');
    } else if (targetTab === 'god-mode') {
      setPassedGodModeValues({
        panjang: p,
        lebar: l,
        substance: article.substance,
        flute: article.flute,
        diskon: 0,
        quantity: 2500,
      });
      setActiveTab('god-mode');
    } else if (targetTab === 'tonnage') {
      setPassedTonnageRows([
        {
          id: `tonnage_${Date.now()}_article`,
          panjang: p,
          lebar: l,
          substance: article.substance,
          flute: article.flute,
          quantity: 2500,
        },
      ]);
      setActiveTab('tonnage');
    }
  };

  // Handler for sending Box Converter sheet to Price Calc
  const handleBoxToPrice = (sheetP: number, sheetL: number, flute: string) => {
    setPassedPriceRows([
      {
        id: `row_${Date.now()}_box`,
        panjang: sheetP,
        lebar: sheetL,
        substance: 'K125/M125/K125',
        flute: flute,
        diskon: 0,
      },
    ]);
    setActiveTab('price');
  };

  // Handler for sending Box Converter sheet to God Mode
  const handleBoxToGodMode = (sheetP: number, sheetL: number, flute: string) => {
    setPassedGodModeValues({
      panjang: sheetP,
      lebar: sheetL,
      substance: 'K125/M125/K125',
      flute: flute,
      diskon: 0,
      quantity: 2500,
    });
    setActiveTab('god-mode');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-[#080d1a] border-r border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-400" />
                <span className="font-black text-white font-mono">VINNS CARTON</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarNav
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <div className="relative">
          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#080d1a]">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-amber-400"
            >
              <Menu className="w-4 h-4" />
              <span>MENU</span>
            </button>
            <div className="text-xs font-black font-mono text-white tracking-wider">
              VINNS CARTON CALC
            </div>
          </div>
          <Header activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#030712]">
          {activeTab === 'dashboard' && (
            <DashboardOverview onSelectModule={setActiveTab} />
          )}

          {activeTab === 'articles' && (
            <ArticleExplorer onUseArticle={handleUseArticle} />
          )}

          {activeTab === 'price' && (
            <PriceCalculator
              key={JSON.stringify(passedPriceRows)}
              initialRows={passedPriceRows}
            />
          )}

          {activeTab === 'moq' && <MoqCalculator />}

          {activeTab === 'tonnage' && (
            <TonnageCalculator
              key={JSON.stringify(passedTonnageRows)}
              initialRows={passedTonnageRows}
            />
          )}

          {activeTab === 'god-mode' && (
            <GodModeCalculator
              key={JSON.stringify(passedGodModeValues)}
              initialValues={passedGodModeValues}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'box-converter' && (
            <BoxConverter
              onSendToPriceCalc={handleBoxToPrice}
              onSendToGodMode={handleBoxToGodMode}
            />
          )}

          {activeTab === 'cost-simulator' && (
            <CostSimulator />
          )}
        </main>
      </div>
    </div>
  );
}
