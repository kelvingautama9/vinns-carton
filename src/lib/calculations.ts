import priceListJson from '../data/priceList.json';
import { 
  BoxConverterParams, 
  BoxConverterResult, 
  CostSimulationParams, 
  CostSimulationResult,
  PaperLayer 
} from '../types';

export const FLUTE_TAKEUP_FACTORS: Record<string, number> = {
  'B': 1.35,
  'C': 1.43,
  'E': 1.25,
  'A': 1.54,
  'BC': 1.39, // Average fallback if single factor used
};

// Factory standard joint flap presets (mm)
export const FACTORY_JOINT_FLAPS: Record<string, number> = {
  'B': 40,
  'C': 44,
  'BC': 50,
  'E': 35,
};

// Factory standard creasing/flap allowances for Sheet Width (mm)
export const FACTORY_CREASE_ALLOWANCES: Record<string, number> = {
  'B': 10,
  'C': 14,
  'BC': 18,
  'E': 6,
};

export const FLUTE_THICKNESS: Record<string, number> = {
  'B': 3.0,
  'C': 4.0,
  'BC': 7.0,
  'E': 1.5,
};

export const priceList: Record<string, Record<string, number>> = priceListJson as Record<string, Record<string, number>>;

/**
 * Normalizes substance strings like "k125 / m125 / k125", "K125-M125-K125" into standard "K125/M125/K125"
 */
export const normalizeSubstance = (substance: string): string => {
  if (!substance) return '';
  return substance
    .trim()
    .toUpperCase()
    .replace(/[\s\-_]+/g, '/')
    .replace(/\/+/g, '/');
};

/**
 * Extracts GSM numbers from substance e.g. "K125/M125/K125" -> [125, 125, 125]
 */
export const parseSubstance = (substance: string): number[] => {
  if (!substance) return [];
  const normalized = normalizeSubstance(substance);
  return normalized
    .split('/')
    .map(s => {
      const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? 0 : num;
    })
    .filter(n => n > 0);
};

/**
 * Calculates total GSM (Grammage) based on layers and flute take-up factor (pure decimal precision)
 */
export const calculateGrammage = (
  substance: string, 
  flute: string,
  customFactor?: number,
  customFactorDW?: { bFactor?: number; cFactor?: number }
): number => {
  const paperWeights = parseSubstance(substance);
  if (paperWeights.length === 0) return 0;
  
  const cleanFlute = flute.toUpperCase().trim();

  // Single Wall (3 layers: Liner 1, Flute, Liner 2)
  if (paperWeights.length === 3) {
    const [liner1, gramFlute, liner2] = paperWeights;
    const takeup = customFactor !== undefined ? customFactor : (FLUTE_TAKEUP_FACTORS[cleanFlute] || 1.35);
    return liner1 + (gramFlute * takeup) + liner2;
  }

  // Double Wall (5 layers: Liner 1, Flute 1, Liner 2, Flute 2, Liner 3)
  if (paperWeights.length === 5) {
    const [liner1, gramFlute1, liner2, gramFlute2, liner3] = paperWeights;
    const factor1 = customFactorDW?.bFactor ?? (customFactor !== undefined ? customFactor : (FLUTE_TAKEUP_FACTORS['B'] || 1.35));
    const factor2 = customFactorDW?.cFactor ?? (customFactor !== undefined ? customFactor : (FLUTE_TAKEUP_FACTORS['C'] || 1.43));
    return (
      liner1 +
      (gramFlute1 * factor1) +
      liner2 +
      (gramFlute2 * factor2) +
      liner3
    );
  }

  // Generic or multi-layer fallback
  let totalGrammage = 0;
  let fluteIndex = 0;
  for (let i = 0; i < paperWeights.length; i++) {
    if (i % 2 === 1) {
      // Flute layer
      let takeup = 1.35;
      if (fluteIndex === 0) {
        takeup = customFactorDW?.bFactor ?? (customFactor !== undefined ? customFactor : (FLUTE_TAKEUP_FACTORS[cleanFlute] || 1.35));
      } else {
        takeup = customFactorDW?.cFactor ?? (customFactor !== undefined ? customFactor : (FLUTE_TAKEUP_FACTORS['C'] || 1.43));
      }
      totalGrammage += paperWeights[i] * takeup;
      fluteIndex++;
    } else {
      // Liner layer
      totalGrammage += paperWeights[i];
    }
  }

  return totalGrammage;
};

/**
 * Calculates total tonnage for given quantity of carton sheets
 */
export const calculateTonnage = ({
  panjang,
  lebar,
  substance,
  flute,
  quantity,
}: {
  panjang: number; // in mm
  lebar: number; // in mm
  substance: string;
  flute: string;
  quantity: number;
}): number => {
  if (panjang <= 0 || lebar <= 0 || quantity <= 0 || !substance || !flute) return 0;
  const grammage = calculateGrammage(substance, flute);
  if (grammage === 0) return 0;

  const areaInM2 = (panjang / 1000) * (lebar / 1000);
  const weightPerSheetInKg = (grammage * areaInM2) / 1000;
  const totalWeightInKg = weightPerSheetInKg * quantity;
  return totalWeightInKg / 1000; // in tons
};

/**
 * Factory Fleet Standards (Standar Armada Pabrik):
 * - FSK: 1.8 Ton - 2 Ton (1.800 - 2.000 kg)
 * - FUSO: 2.1 Ton - 2.5 Ton (2.100 - 2.500 kg)
 * - FUSO ORI: 2.5 Ton - 3.4 Ton (2.500 - 3.400 kg)
 * - WINGBOX: 5 Ton - 6.3 Ton (5.000 - 6.300 kg)
 */
export const FACTORY_FLEET_STANDARDS = {
  FSK: {
    id: 'FSK',
    name: 'FSK',
    minTons: 1.8,
    maxTons: 2.0,
    minKg: 1800,
    maxKg: 2000,
    label: '1.8 Ton - 2 Ton',
    description: 'Armada FSK Pabrik (1.800 - 2.000 kg)',
  },
  FUSO: {
    id: 'FUSO',
    name: 'FUSO',
    minTons: 2.1,
    maxTons: 2.5,
    minKg: 2100,
    maxKg: 2500,
    label: '2.1 Ton - 2.5 Ton',
    description: 'Armada Fuso Standar (2.100 - 2.500 kg)',
  },
  FUSO_ORI: {
    id: 'FUSO_ORI',
    name: 'FUSO ORI',
    minTons: 2.5,
    maxTons: 3.4,
    minKg: 2500,
    maxKg: 3400,
    label: '2.5 Ton - 3.4 Ton',
    description: 'Armada Fuso Ori (2.500 - 3.400 kg)',
  },
  WINGBOX: {
    id: 'WINGBOX',
    name: 'WINGBOX',
    minTons: 5.0,
    maxTons: 6.3,
    minKg: 5000,
    maxKg: 6300,
    label: '5 Ton - 6.3 Ton',
    description: 'Armada Wingbox Kapasitas Besar (5.000 - 6.300 kg)',
  },
} as const;

/**
 * Calculates trip estimates for factory fleet standards
 */
export const calculateFleetTrips = (totalTons: number) => {
  if (!totalTons || totalTons <= 0) {
    return {
      fskTrips: 0,
      fusoTrips: 0,
      fusoOriTrips: 0,
      wingboxTrips: 0,
      fskMinTrips: 0,
      fskMaxTrips: 0,
      fusoMinTrips: 0,
      fusoMaxTrips: 0,
      fusoOriMinTrips: 0,
      fusoOriMaxTrips: 0,
      wingboxMinTrips: 0,
      wingboxMaxTrips: 0,
    };
  }

  // Safe optimal trips (based on max safe capacity)
  const fskTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FSK.maxTons);
  const fusoTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FUSO.maxTons);
  const fusoOriTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FUSO_ORI.maxTons);
  const wingboxTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.WINGBOX.maxTons);

  // Conservative trips (based on min capacity)
  const fskMinTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FSK.maxTons);
  const fskMaxTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FSK.minTons);

  const fusoMinTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FUSO.maxTons);
  const fusoMaxTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FUSO.minTons);

  const fusoOriMinTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FUSO_ORI.maxTons);
  const fusoOriMaxTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.FUSO_ORI.minTons);

  const wingboxMinTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.WINGBOX.maxTons);
  const wingboxMaxTrips = Math.ceil(totalTons / FACTORY_FLEET_STANDARDS.WINGBOX.minTons);

  return {
    fskTrips,
    fusoTrips,
    fusoOriTrips,
    wingboxTrips,
    fskMinTrips,
    fskMaxTrips,
    fusoMinTrips,
    fusoMaxTrips,
    fusoOriMinTrips,
    fusoOriMaxTrips,
    wingboxMinTrips,
    wingboxMaxTrips,
  };
};

/**
 * Calculates weight per individual sheet in grams and kilograms
 */
export const calculateWeightPerSheet = ({
  panjang,
  lebar,
  substance,
  flute,
}: {
  panjang: number;
  lebar: number;
  substance: string;
  flute: string;
}): { weightGram: number; weightKg: number; areaM2: number; grammage: number } => {
  if (panjang <= 0 || lebar <= 0 || !substance || !flute) {
    return { weightGram: 0, weightKg: 0, areaM2: 0, grammage: 0 };
  }
  const grammage = calculateGrammage(substance, flute);
  const areaM2 = (panjang / 1000) * (lebar / 1000);
  const weightGram = grammage * areaM2;
  return {
    weightGram,
    weightKg: weightGram / 1000,
    areaM2,
    grammage,
  };
};

/**
 * Looks up sheet price and applies discount
 */
export const calculatePrice = ({
  panjang,
  lebar,
  substance,
  flute,
  diskon = 0,
}: {
  panjang: number;
  lebar: number;
  substance: string;
  flute: string;
  diskon?: number;
}): { unitPrice: number; pricePerM2: number; grossPrice: number } | null => {
  if (panjang <= 0 || lebar <= 0 || !substance || !flute) {
    return null;
  }

  const normalized = normalizeSubstance(substance);
  const fluteKey = `Flute_${flute.toUpperCase().trim()}`;
  const priceData = priceList[normalized];

  if (!priceData || !priceData[fluteKey]) {
    return null;
  }

  const hargaPerMeter = priceData[fluteKey];
  const areaM2 = (panjang * lebar) / 1_000_000;
  const hargaGross = areaM2 * hargaPerMeter;
  const diskonValue = isNaN(diskon) ? 0 : Math.max(0, Math.min(100, diskon));
  const hargaSetelahDiskon = hargaGross * (1 - diskonValue / 100);

  return {
    unitPrice: Math.round(hargaSetelahDiskon),
    pricePerM2: hargaPerMeter,
    grossPrice: Math.round(hargaGross),
  };
};

/**
 * Calculates Out (number of sheet strips per Corrugator roll width max 2480mm)
 */
export const hitungOut = (lebar: number): number => {
  if (lebar <= 0) return 0;
  if (lebar < 315) {
    return 7;
  }
  if (lebar > 2480) {
    return 0; // Exceeds standard 2.48m corrugator roll width
  }
  return Math.floor(2480 / lebar);
};

/**
 * Calculates Minimum Order Quantity (MOQ)
 */
export const calculateMOQ = ({
  panjang,
  lebar,
}: {
  panjang: number;
  lebar: number;
}): { moq: number; out: number; isManufacturable: boolean } => {
  if (panjang <= 0 || lebar <= 0) {
    return { moq: 0, out: 0, isManufacturable: false };
  }
  const out = hitungOut(lebar);
  if (out === 0) {
    return { moq: 0, out: 0, isManufacturable: false };
  }
  const moq = Math.ceil((500_000 / panjang) * out);
  return { moq, out, isManufacturable: true };
};

/**
 * Calculates Flat Sheet Dimensions, SQM, Total GSM & Box Weight from 3D Box Dimensions
 */
export const calculateBoxToSheet = ({
  boxLength,
  boxWidth,
  boxHeight,
  boxStyle = 'RSC',
  flute = 'C',
  jointFlap,
  creaseAllowance,
  overlapFactor = 1,
  customFluteFactor,
  customFluteFactor1,
  customFluteFactor2,
  substance = 'K110/M125/K110',
  customLayers,
  calcMode = 'FACTORY_EXCEL',
}: BoxConverterParams): BoxConverterResult => {
  const P = Math.max(0, boxLength);
  const L = Math.max(0, boxWidth);
  const T = Math.max(0, boxHeight);
  
  // 1. Determine effective Joint Flap (Lidah Lem)
  const defaultFlap = FACTORY_JOINT_FLAPS[flute] || 44;
  const flap = jointFlap !== undefined && !isNaN(jointFlap) ? Math.max(0, jointFlap) : defaultFlap;

  // 2. Determine effective Creasing/Flap Allowance (for sheet width)
  const defaultAllowance = FACTORY_CREASE_ALLOWANCES[flute] || 14;
  const allowance = creaseAllowance !== undefined && !isNaN(creaseAllowance) ? creaseAllowance : defaultAllowance;

  // 3. Determine Flute Factors
  let factor1 = 1.35;
  let factor2 = 1.43;
  let factorDisplay = '';

  if (flute === 'B') {
    factor1 = customFluteFactor ?? 1.35;
    factorDisplay = `B (${factor1})`;
  } else if (flute === 'C') {
    factor1 = customFluteFactor ?? 1.43;
    factorDisplay = `C (${factor1})`;
  } else if (flute === 'E') {
    factor1 = customFluteFactor ?? 1.25;
    factorDisplay = `E (${factor1})`;
  } else if (flute === 'BC') {
    factor1 = customFluteFactor1 ?? 1.35;
    factor2 = customFluteFactor2 ?? 1.43;
    factorDisplay = `BC (Flute 1: ${factor1}, Flute 2: ${factor2})`;
  } else {
    factor1 = customFluteFactor ?? 1.35;
    factorDisplay = `Custom (${factor1})`;
  }

  // 4. Calculate Sheet Blank Dimensions
  let sheetLength = 0;
  let sheetWidth = 0;
  let creasingLength: number[] = [];
  let creasingWidth: number[] = [];
  let description = '';
  let sheetLengthFormula = '';
  let sheetWidthFormula = '';

  if (boxStyle === 'RSC') {
    // Regular Slotted Carton (Box A1)
    sheetLength = 2 * (P + L) + flap;
    sheetLengthFormula = `((P:${P} + L:${L}) * 2) + Lidah:${flap} = ${sheetLength} mm`;

    if (calcMode === 'FACTORY_EXCEL') {
      // Standard Factory Excel formula: L + T + allowance
      sheetWidth = L + T + allowance;
      const topFlap = Math.round((L + allowance) / 2);
      const bottomFlap = (L + allowance) - topFlap;
      creasingLength = [P, L, P, L, flap];
      creasingWidth = [topFlap, T, bottomFlap];
      sheetWidthFormula = `L:${L} + T:${T} + Allowance:${allowance} = ${sheetWidth} mm`;
      description = `RSC (Box A1 - Standar Pabrik) Lidah ${flap}mm, Toleransi Lebar +${allowance}mm`;
    } else {
      // Symmetrical Flap formula: 2 * (L/2) + T
      const flapWidth = Math.round(L / 2);
      sheetWidth = 2 * flapWidth + T;
      creasingLength = [P, L, P, L, flap];
      creasingWidth = [flapWidth, T, flapWidth];
      sheetWidthFormula = `(2 * Tutup:${flapWidth}) + T:${T} = ${sheetWidth} mm`;
      description = `RSC (Box A1 - Simetris) Lidah ${flap}mm, Tutup ${flapWidth}mm`;
    }
  } else if (boxStyle === 'FOL') {
    // Full Overlap Slotted Carton (Flap overlap penuh sebesar lebar L)
    sheetLength = 2 * (P + L) + flap;
    sheetWidth = 2 * L + T + allowance;
    creasingLength = [P, L, P, L, flap];
    creasingWidth = [L, T, L + allowance];
    sheetLengthFormula = `((P:${P} + L:${L}) * 2) + Lidah:${flap} = ${sheetLength} mm`;
    sheetWidthFormula = `(2 * L:${L}) + T:${T} + Allowance:${allowance} = ${sheetWidth} mm`;
    description = `Full Overlap Carton (FOL) dengan Tutup Penuh ${L}mm & Sambungan Lem ${flap}mm`;
  } else if (boxStyle === 'TOP_BOTTOM') {
    // Two-Piece Telescope / Cap & Bottom Box
    sheetLength = P + 2 * T + allowance;
    sheetWidth = L + 2 * T + allowance;
    creasingLength = [T, P + allowance, T];
    creasingWidth = [T, L + allowance, T];
    sheetLengthFormula = `P:${P} + (2 * T:${T}) + Allowance:${allowance} = ${sheetLength} mm`;
    sheetWidthFormula = `L:${L} + (2 * T:${T}) + Allowance:${allowance} = ${sheetWidth} mm`;
    description = `Top & Bottom Box (Telescope Cap). Ukuran Sheet: ${sheetLength}x${sheetWidth}mm, Dinding: ${T}mm`;
  } else {
    // DIE_CUT_MAILER
    const rollFlap = Math.round(T * 0.9);
    sheetLength = 2 * T + 2 * L + P + flap;
    sheetWidth = P + 2 * T + 2 * rollFlap;
    creasingLength = [T, L, T, P, L + flap];
    creasingWidth = [rollFlap, T, P, T, rollFlap];
    sheetLengthFormula = `(2 * T:${T}) + (2 * L:${L}) + P:${P} + Flap:${flap} = ${sheetLength} mm`;
    sheetWidthFormula = `P:${P} + (2 * T:${T}) + (2 * Roll:${rollFlap}) = ${sheetWidth} mm`;
    description = `Die Cut Mailer (Locking Box). Sheet Blank: ${sheetLength}x${sheetWidth}mm`;
  }

  // 5. Calculate SQM (m2)
  const sheetAreaM2 = (sheetLength * sheetWidth) / 1_000_000;
  const sqmFormula = `(${sheetLength} * ${sheetWidth}) / 1.000.000 = ${sheetAreaM2.toFixed(6)} m²`;

  // 6. Calculate Total GSM (Pure Decimal Precision)
  let totalGsm = 0;
  let gsmFormula = '';
  let activeSubstance = substance || 'K110/M125/K110';

  if (customLayers) {
    const top = customLayers.topLiner || 0;
    const fl1 = customLayers.fluteMedium1 || 0;
    const mid = customLayers.middleLiner || 0;
    const fl2 = customLayers.fluteMedium2 || 0;
    const bot = customLayers.bottomLiner || 0;

    const fl1Eff = fl1 * factor1;
    const fl2Eff = fl2 * factor2;

    if (flute === 'BC' || fl2 > 0 || mid > 0) {
      totalGsm = top + fl1Eff + mid + fl2Eff + bot;
      const gsmKg = (totalGsm / 1000).toFixed(4);
      gsmFormula = `${top} + (${fl1} * ${factor1}) + ${mid} + (${fl2} * ${factor2}) + ${bot} = ${totalGsm.toFixed(2)} gsm → GSM : ${gsmKg} kg`;
      activeSubstance = `Custom DW (${top}/${fl1}/${mid}/${fl2}/${bot})`;
    } else {
      totalGsm = top + fl1Eff + bot;
      const gsmKg = (totalGsm / 1000).toFixed(4);
      gsmFormula = `${top} + (${fl1} * ${factor1}) + ${bot} = ${totalGsm.toFixed(2)} gsm → GSM : ${gsmKg} kg`;
      activeSubstance = `Custom SW (${top}/${fl1}/${bot})`;
    }
  } else {
    const weights = parseSubstance(activeSubstance);
    if (weights.length === 3) {
      const [l1, fl, l2] = weights;
      const flEff = fl * factor1;
      totalGsm = l1 + flEff + l2;
      const gsmKg = (totalGsm / 1000).toFixed(4);
      gsmFormula = `${l1} + (${fl} * ${factor1}) + ${l2} = ${totalGsm.toFixed(2)} gsm → GSM : ${gsmKg} kg`;
    } else if (weights.length === 5) {
      const [l1, fl1, l2, fl2, l3] = weights;
      const fl1Eff = fl1 * factor1;
      const fl2Eff = fl2 * factor2;
      totalGsm = l1 + fl1Eff + l2 + fl2Eff + l3;
      const gsmKg = (totalGsm / 1000).toFixed(4);
      gsmFormula = `${l1} + (${fl1} * ${factor1}) + ${l2} + (${fl2} * ${factor2}) + ${l3} = ${totalGsm.toFixed(2)} gsm → GSM : ${gsmKg} kg`;
    } else {
      totalGsm = calculateGrammage(activeSubstance, flute, factor1, { bFactor: factor1, cFactor: factor2 });
      const gsmKg = (totalGsm / 1000).toFixed(4);
      gsmFormula = `Gramatur ${activeSubstance} = ${totalGsm.toFixed(2)} gsm → GSM : ${gsmKg} kg`;
    }
  }

  // 7. Calculate Weight per Box (KG & Gram)
  // Weight (KG) = (Total GSM * SQM) / 1000 = (Total GSM in KG * SQM)
  const weightPerBoxKg = (totalGsm * sheetAreaM2) / 1000;
  const weightPerBoxGram = totalGsm * sheetAreaM2;
  const gsmInKg = (totalGsm / 1000).toFixed(4);
  const weightFormula = `(GSM: ${gsmInKg} kg * Luas: ${sheetAreaM2.toFixed(6)} m²) = ${weightPerBoxKg.toFixed(5)} kg (${weightPerBoxGram.toFixed(2)} g)`;

  return {
    sheetLength,
    sheetWidth,
    sheetAreaM2,
    creasingLength,
    creasingWidth,
    boxStyle,
    description,
    totalGsm,
    weightPerBoxKg,
    weightPerBoxGram,
    fluteFactorUsed: factorDisplay,
    substanceUsed: activeSubstance,
    formulaBreakdown: {
      sheetLengthFormula,
      sheetWidthFormula,
      sqmFormula,
      gsmFormula,
      weightFormula,
    },
  };
};

/**
 * Simulates Detailed Custom Paper Substance Cost Breakdown
 */
export const calculateCustomCostBreakdown = ({
  sheetLength,
  sheetWidth,
  quantity = 1000,
  wallType = 'SINGLE_WALL',
  flute = 'B',
  layers,
  glueCostPerM2 = 180,
  conversionCostPerM2 = 450,
  wastePercent = 5,
  marginPercent = 15,
}: CostSimulationParams): CostSimulationResult => {
  const P = Math.max(1, sheetLength);
  const L = Math.max(1, sheetWidth);
  const qty = Math.max(1, quantity);
  const areaM2 = (P * L) / 1_000_000;

  // 1. Calculate raw paper cost per m2 and total GSM
  let totalGsm = 0;
  let paperCostPerM2 = 0;

  layers.forEach((layer) => {
    const takeup = layer.type === 'flute' ? (layer.takeUpFactor || 1.35) : 1.0;
    const effectiveGsm = layer.gsm * takeup;
    totalGsm += effectiveGsm;

    // Paper cost per m2 = (effectiveGsm / 1000 kg/m2) * pricePerKg
    const costForLayer = (effectiveGsm / 1000) * layer.pricePerKg;
    paperCostPerM2 += costForLayer;
  });

  // 2. Add glue and converting cost
  const rawProductionCostPerM2 = paperCostPerM2 + glueCostPerM2 + conversionCostPerM2;

  // 3. Add waste factor
  const wasteRate = Math.max(0, wastePercent) / 100;
  const costWithWastePerM2 = rawProductionCostPerM2 * (1 + wasteRate);

  // 4. Add margin
  const marginRate = Math.max(0, marginPercent) / 100;
  const sellingPricePerM2 = costWithWastePerM2 / (1 - marginRate);

  // Per sheet numbers
  const costPerSheet = Math.round(costWithWastePerM2 * areaM2);
  const sellingPricePerSheet = Math.round(sellingPricePerM2 * areaM2);
  const weightPerSheetKg = (totalGsm * areaM2) / 1000;

  // Total order numbers
  const totalOrderCost = costPerSheet * qty;
  const totalOrderValue = sellingPricePerSheet * qty;
  const totalProfit = totalOrderValue - totalOrderCost;
  const totalWeightTons = (weightPerSheetKg * qty) / 1000;

  // Percent breakdown
  const paperPct = Math.round((paperCostPerM2 / sellingPricePerM2) * 100);
  const gluePct = Math.round((glueCostPerM2 / sellingPricePerM2) * 100);
  const convPct = Math.round((conversionCostPerM2 / sellingPricePerM2) * 100);
  const wasteCost = costWithWastePerM2 - rawProductionCostPerM2;
  const wastePct = Math.round((wasteCost / sellingPricePerM2) * 100);
  const marginPct = Math.round(marginPercent);

  return {
    totalGsm: Math.round(totalGsm),
    paperCostPerM2: Math.round(paperCostPerM2),
    glueCostPerM2: Math.round(glueCostPerM2),
    conversionCostPerM2: Math.round(conversionCostPerM2),
    rawProductionCostPerM2: Math.round(rawProductionCostPerM2),
    costWithWastePerM2: Math.round(costWithWastePerM2),
    sellingPricePerM2: Math.round(sellingPricePerM2),
    costPerSheet,
    sellingPricePerSheet,
    weightPerSheetKg: Number(weightPerSheetKg.toFixed(4)),
    totalOrderValue,
    totalOrderCost,
    totalProfit,
    totalWeightTons: Number(totalWeightTons.toFixed(4)),
    breakdown: {
      paperPercent: paperPct,
      gluePercent: gluePct,
      conversionPercent: convPct,
      wastePercent: wastePct,
      marginPercent: marginPct,
    },
  };
};

/**
 * Formatter helper for Indonesian Rupiah
 */
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
};

/**
 * Formatter helper for numbers with thousand separator
 */
export const formatNumber = (val: number, decimals = 0): string => {
  return (val || 0).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
