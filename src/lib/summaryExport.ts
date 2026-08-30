import { FleetAnalysisSummary } from '../types';
import { formatCurrency, analyzeFleetRequirements } from './calculations';

export interface SummaryExportItem {
  id?: string;
  name?: string;
  panjang: number;
  lebar: number;
  tinggi?: number;
  boxStyle?: string;
  substance: string;
  flute: string;
  gsm?: number;
  quantity: number;
  unitPrice?: number;
  grossPrice?: number;
  discount?: number;
  moq?: number;
  out?: number;
  weightGram: number;
  weightKg?: number;
  rowWeightKg: number;
  rowTonnageTons: number;
  areaM2?: number;
}

export interface SummaryExportData {
  title: string;
  sourceCalculator: 'TONNAGE' | 'GOD_MODE' | 'PRICE' | 'BOX_CONVERTER' | 'MOQ' | 'COST_SIMULATOR';
  date?: string;
  items: SummaryExportItem[];
  totalTons: number;
  totalKg: number;
  totalPcs: number;
  totalAreaM2?: number;
  totalGrossOrder?: number;
  totalNetOrder?: number;
  fleetAnalysis?: FleetAnalysisSummary;
  additionalNotes?: string[];
}

/**
 * Ensures fleet analysis is present or calculated from totalTons
 */
export const getOrCalculateFleetAnalysis = (data: SummaryExportData): FleetAnalysisSummary => {
  if (data.fleetAnalysis) return data.fleetAnalysis;
  return analyzeFleetRequirements(data.totalTons);
};

/**
 * Generate a clean, structured WhatsApp message snippet
 */
export const generateWhatsAppSnippet = (data: SummaryExportData): string => {
  const dateStr = data.date || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const fleet = getOrCalculateFleetAnalysis(data);

  const lines: string[] = [];
  lines.push(`📦 *${data.title.toUpperCase()}*`);
  lines.push(`🗓 *Tanggal:* ${dateStr}`);
  lines.push(``);

  lines.push(`📐 *RINCIAN DIMENSI & SPESIFIKASI (${data.items.length} Item):*`);
  data.items.forEach((item, idx) => {
    const area = item.areaM2 ? ` (${item.areaM2.toFixed(4)} m²)` : '';
    const boxDim = item.tinggi ? ` (Box: ${item.panjang}x${item.lebar}x${item.tinggi} mm)` : '';
    lines.push(`${idx + 1}️⃣ *Item ${idx + 1}:* ${item.panjang} x ${item.lebar} mm${area}${boxDim}`);
    lines.push(`   • *Substance:* ${item.substance} (${item.flute})${item.gsm ? ` - ${item.gsm} GSM` : ''}`);
    lines.push(`   • *Quantity:* ${item.quantity.toLocaleString('id-ID')} pcs`);
    lines.push(`   • *Berat/pcs:* ${item.weightGram.toFixed(2)} g (${(item.weightGram / 1000).toFixed(4)} kg)`);
    lines.push(`   • *Total Berat:* ${item.rowWeightKg.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg (*${item.rowTonnageTons.toFixed(4)} Ton*)`);
    
    if (item.unitPrice !== undefined && item.unitPrice > 0) {
      lines.push(`   • *Harga Net:* ${formatCurrency(item.unitPrice)}/pcs ${item.discount ? `(Disc ${item.discount}%)` : ''}`);
    }
    if (item.moq !== undefined && item.moq > 0) {
      lines.push(`   • *Est. MOQ:* ${item.moq.toLocaleString('id-ID')} pcs ${item.out ? `(Out: ${item.out})` : ''}`);
    }
    lines.push(``);
  });

  lines.push(`⚖️ *TOTAL KESELURUHAN:*`);
  lines.push(`• *Total Tonase:* *${data.totalTons.toFixed(4)} TON* (${data.totalKg.toLocaleString('id-ID')} kg)`);
  lines.push(`• *Total Kuantitas:* *${data.totalPcs.toLocaleString('id-ID')} pcs*${data.totalAreaM2 ? ` (${data.totalAreaM2.toLocaleString('id-ID')} m²)` : ''}`);
  if (data.totalNetOrder && data.totalNetOrder > 0) {
    lines.push(`• *Total Nilai Order:* *${formatCurrency(data.totalNetOrder)}*`);
  }
  lines.push(``);

  lines.push(`🚚 *ESTIMASI KEBUTUHAN ARMADA (STANDAR PABRIK):*`);
  if (fleet.isBelowMinimumDelivery) {
    lines.push(`⚠️ *PERINGATAN: Di Bawah Standar Minimal Kirim Pabrik*`);
    lines.push(`   Total tonase belum mencapai batas armada terkecil (FSK Min. 1.8 Ton).`);
    lines.push(`   👉 *Saran Penambahan:* Kurang *+${fleet.minimumShortageKg.toLocaleString('id-ID')} kg* (+${fleet.minimumShortageTons.toFixed(3)} T) untuk 1 Truk FSK.`);
    lines.push(``);
  } else if (fleet.recommendedFleet) {
    lines.push(`✅ *Rekomendasi Utama:* ${fleet.recommendedFleet.name} (${fleet.recommendedFleet.truckDisplay})`);
    lines.push(``);
  }

  const { fsk, fuso, fusoOri, wingbox } = fleet.vehicles;
  const getStatusIcon = (status: string) => (status === 'optimal' ? '🟢' : status === 'underload' ? '🔴' : '🟡');
  
  lines.push(`• *FSK (1.8 - 2.0 T):* ${getStatusIcon(fsk.status)} ${fsk.truckDisplay} | ${fsk.advice}`);
  lines.push(`• *FUSO (2.1 - 2.5 T):* ${getStatusIcon(fuso.status)} ${fuso.truckDisplay} | ${fuso.advice}`);
  lines.push(`• *FUSO ORI (2.5 - 3.4 T):* ${getStatusIcon(fusoOri.status)} ${fusoOri.truckDisplay} | ${fusoOri.advice}`);
  lines.push(`• *WINGBOX (5.0 - 6.3 T):* ${getStatusIcon(wingbox.status)} ${wingbox.truckDisplay} | ${wingbox.advice}`);

  lines.push(``);
  lines.push(`_Generated via Vinns Corrugated Calculator_`);

  return lines.join('\n');
};

/**
 * Generate a clean Email format with subject & structured body
 */
export const generateEmailFormat = (data: SummaryExportData): { subject: string; body: string } => {
  const dateStr = data.date || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const fleet = getOrCalculateFleetAnalysis(data);

  const subject = `[REKAP ORDER] ${data.title} - ${data.totalTons.toFixed(3)} Ton (${data.totalPcs.toLocaleString('id-ID')} pcs) - ${dateStr}`;

  const bodyLines: string[] = [];
  bodyLines.push(`Yth. Rekan / Tim Logistik & Sales,`);
  bodyLines.push(``);
  bodyLines.push(`Berikut kami lampirkan rincian kalkulasi pesanan karton box (Dimensi, Tonase, & Kebutuhan Armada):`);
  bodyLines.push(`---------------------------------------------------------------------------------`);
  bodyLines.push(`Tanggal Pembuatan : ${dateStr}`);
  bodyLines.push(`Kategori Laporan  : ${data.title}`);
  bodyLines.push(`---------------------------------------------------------------------------------`);
  bodyLines.push(``);

  bodyLines.push(`1. RINCIAN SPESIFIKASI ITEM (${data.items.length} Item)`);
  data.items.forEach((item, idx) => {
    bodyLines.push(`   [Item ${idx + 1}]`);
    bodyLines.push(`   - Ukuran Sheet   : ${item.panjang} x ${item.lebar} mm ${item.areaM2 ? `(${item.areaM2.toFixed(4)} m²)` : ''}`);
    if (item.tinggi) {
      bodyLines.push(`   - Dimensi Box    : ${item.panjang} x ${item.lebar} x ${item.tinggi} mm`);
    }
    bodyLines.push(`   - Substance      : ${item.substance} (${item.flute}) ${item.gsm ? `| GSM: ${item.gsm}` : ''}`);
    bodyLines.push(`   - Kuantitas      : ${item.quantity.toLocaleString('id-ID')} pcs`);
    bodyLines.push(`   - Berat Satuan   : ${item.weightGram.toFixed(2)} gram / pcs`);
    bodyLines.push(`   - Total Berat    : ${item.rowWeightKg.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg (${item.rowTonnageTons.toFixed(4)} Ton)`);
    if (item.unitPrice) {
      bodyLines.push(`   - Harga Net/pcs  : ${formatCurrency(item.unitPrice)} ${item.discount ? `(Diskon ${item.discount}%)` : ''}`);
    }
    if (item.moq) {
      bodyLines.push(`   - Est. MOQ       : ${item.moq.toLocaleString('id-ID')} pcs (Out Mesin: ${item.out || '-'})`);
    }
    bodyLines.push(``);
  });

  bodyLines.push(`2. REKAPITULASI TOTAL ORDER`);
  bodyLines.push(`   - Total Tonase      : ${data.totalTons.toFixed(4)} TON (${data.totalKg.toLocaleString('id-ID')} kg)`);
  bodyLines.push(`   - Total Quantity    : ${data.totalPcs.toLocaleString('id-ID')} pcs ${data.totalAreaM2 ? `(${data.totalAreaM2.toLocaleString('id-ID')} m²)` : ''}`);
  if (data.totalNetOrder) {
    bodyLines.push(`   - Total Nilai Order : ${formatCurrency(data.totalNetOrder)}`);
  }
  bodyLines.push(``);

  bodyLines.push(`3. ANALISIS KEBUTUHAN ARMADA (STANDAR PABRIK)`);
  if (fleet.isBelowMinimumDelivery) {
    bodyLines.push(`   [PERINGATAN MINIMAL PENGIRIMAN]`);
    bodyLines.push(`   Total tonase (${data.totalTons.toFixed(4)} Ton) belum memenuhi standar minimal muatan armada terkecil (FSK min. 1.8 Ton).`);
    bodyLines.push(`   Saran: Tambahkan +${fleet.minimumShortageKg.toLocaleString('id-ID')} kg (+${fleet.minimumShortageTons.toFixed(3)} Ton) agar memenuhi 1 unit truk FSK.`);
    bodyLines.push(``);
  }
  const { fsk, fuso, fusoOri, wingbox } = fleet.vehicles;
  bodyLines.push(`   - FSK (1.8 - 2.0 Ton)      : ${fsk.truckDisplay} | ${fsk.advice}`);
  bodyLines.push(`   - FUSO (2.1 - 2.5 Ton)     : ${fuso.truckDisplay} | ${fuso.advice}`);
  bodyLines.push(`   - FUSO ORI (2.5 - 3.4 Ton) : ${fusoOri.truckDisplay} | ${fusoOri.advice}`);
  bodyLines.push(`   - WINGBOX (5.0 - 6.3 Ton)  : ${wingbox.truckDisplay} | ${wingbox.advice}`);
  bodyLines.push(``);
  bodyLines.push(`Demikian informasi rincian kalkulasi ini kami sampaikan.`);
  bodyLines.push(`Terima kasih.`);

  return { subject, body: bodyLines.join('\n') };
};

/**
 * Generate CSV text
 */
export const generateSummaryCSV = (data: SummaryExportData): string => {
  const fleet = getOrCalculateFleetAnalysis(data);

  const headers = [
    'No',
    'Item/Deskripsi',
    'Panjang (mm)',
    'Lebar (mm)',
    'Substance',
    'Flute',
    'GSM',
    'Quantity (pcs)',
    'Berat/Pcs (gram)',
    'Total Berat (kg)',
    'Tonase (Ton)',
    'Harga Net/Pcs (IDR)',
    'Total Nilai (IDR)',
    'Est MOQ (pcs)',
  ];

  const rows = data.items.map((item, idx) => [
    idx + 1,
    `"${item.name || `Item ${idx + 1}`}"`,
    item.panjang,
    item.lebar,
    `"${item.substance}"`,
    item.flute,
    item.gsm || '-',
    item.quantity,
    item.weightGram.toFixed(2),
    item.rowWeightKg.toFixed(2),
    item.rowTonnageTons.toFixed(4),
    item.unitPrice || 0,
    item.unitPrice ? (item.unitPrice * item.quantity).toFixed(0) : 0,
    item.moq || '-',
  ]);

  const csvRows = [
    `"LAPORAN RINGKASAN KALKULASI KARTON BOX"`,
    `"Tanggal: ${data.date || new Date().toLocaleDateString('id-ID')}"`,
    `""`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    `""`,
    `"GRAND TOTAL","","","","","","",${data.totalPcs},"",${data.totalKg.toFixed(2)},${data.totalTons.toFixed(4)},"",${data.totalNetOrder || 0},""`,
    `""`,
    `"ESTIMASI KEBUTUHAN ARMADA (STANDAR PABRIK)"`,
    `"Status Minimal Kirim","${fleet.isBelowMinimumDelivery ? `BELUM MEMENUHI (Kurang ${fleet.minimumShortageKg} kg)` : 'MEMENUHI STANDAR'}"`,
    `"FSK (1.8 - 2.0 T)","${fleet.vehicles.fsk.truckDisplay} - ${fleet.vehicles.fsk.advice}"`,
    `"FUSO (2.1 - 2.5 T)","${fleet.vehicles.fuso.truckDisplay} - ${fleet.vehicles.fuso.advice}"`,
    `"FUSO ORI (2.5 - 3.4 T)","${fleet.vehicles.fusoOri.truckDisplay} - ${fleet.vehicles.fusoOri.advice}"`,
    `"WINGBOX (5.0 - 6.3 T)","${fleet.vehicles.wingbox.truckDisplay} - ${fleet.vehicles.wingbox.advice}"`,
  ];

  return csvRows.join('\n');
};

/**
 * Generate formatted Plain Text report
 */
export const generateSummaryText = (data: SummaryExportData): string => {
  const dateStr = data.date || new Date().toLocaleDateString('id-ID');
  const fleet = getOrCalculateFleetAnalysis(data);

  const lines: string[] = [];
  lines.push(`================================================================`);
  lines.push(`             RINGKASAN ESTIMASI PESANAN KARTON BOX              `);
  lines.push(`================================================================`);
  lines.push(`Tanggal : ${dateStr}`);
  lines.push(`Modul   : ${data.title}`);
  lines.push(`----------------------------------------------------------------`);
  lines.push(``);

  lines.push(`RINCIAN ITEM (${data.items.length} Item):`);
  data.items.forEach((item, idx) => {
    lines.push(`${idx + 1}. Ukuran     : ${item.panjang} x ${item.lebar} mm ${item.areaM2 ? `(${item.areaM2.toFixed(4)} m²)` : ''}`);
    if (item.tinggi) {
      lines.push(`   Dimensi Box: ${item.panjang} x ${item.lebar} x ${item.tinggi} mm`);
    }
    lines.push(`   Substance  : ${item.substance} (${item.flute}) ${item.gsm ? `| GSM: ${item.gsm}` : ''}`);
    lines.push(`   Kuantitas  : ${item.quantity.toLocaleString('id-ID')} pcs`);
    lines.push(`   Berat/pcs  : ${item.weightGram.toFixed(2)} gram (${(item.weightGram / 1000).toFixed(4)} kg)`);
    lines.push(`   Total Berat: ${item.rowWeightKg.toFixed(2)} kg (${item.rowTonnageTons.toFixed(4)} Ton)`);
    if (item.unitPrice) {
      lines.push(`   Harga Net  : ${formatCurrency(item.unitPrice)} /pcs`);
    }
    if (item.moq) {
      lines.push(`   Est. MOQ   : ${item.moq.toLocaleString('id-ID')} pcs (Out: ${item.out || '-'})`);
    }
    lines.push(``);
  });

  lines.push(`----------------------------------------------------------------`);
  lines.push(`GRAND TOTAL TONASE : ${data.totalTons.toFixed(4)} TON (${data.totalKg.toLocaleString('id-ID')} kg)`);
  lines.push(`TOTAL KUANTITAS    : ${data.totalPcs.toLocaleString('id-ID')} pcs ${data.totalAreaM2 ? `(${data.totalAreaM2.toLocaleString('id-ID')} m²)` : ''}`);
  if (data.totalNetOrder) {
    lines.push(`TOTAL NILAI ORDER  : ${formatCurrency(data.totalNetOrder)}`);
  }
  lines.push(`----------------------------------------------------------------`);
  lines.push(``);

  lines.push(`ESTIMASI KEBUTUHAN ARMADA (STANDAR PABRIK):`);
  if (fleet.isBelowMinimumDelivery) {
    lines.push(`[PERINGATAN] Total tonase belum memenuhi batas minimal armada terkecil (FSK min. 1.8 Ton).`);
    lines.push(`             Kurang +${fleet.minimumShortageKg.toLocaleString('id-ID')} kg (+${fleet.minimumShortageTons.toFixed(3)} Ton) lagi untuk 1 truk FSK.`);
  }
  const { fsk, fuso, fusoOri, wingbox } = fleet.vehicles;
  lines.push(`• FSK (1.8 - 2.0 T)     : ${fsk.truckDisplay} | ${fsk.advice}`);
  lines.push(`• FUSO (2.1 - 2.5 T)    : ${fuso.truckDisplay} | ${fuso.advice}`);
  lines.push(`• FUSO ORI (2.5 - 3.4 T): ${fusoOri.truckDisplay} | ${fusoOri.advice}`);
  lines.push(`• WINGBOX (5.0 - 6.3 T) : ${wingbox.truckDisplay} | ${wingbox.advice}`);
  lines.push(`================================================================`);

  return lines.join('\n');
};

/**
 * Trigger file download helper
 */
export const downloadFile = (content: string, fileName: string, mimeType: string = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
