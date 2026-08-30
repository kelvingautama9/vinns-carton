export interface Article {
  id: string;
  nama_artikel: string;
  ukuran: string;
  substance: string;
  flute: string;
}

export interface PriceRow {
  id: string;
  panjang: number;
  lebar: number;
  substance: string;
  flute: string;
  diskon: number;
}

export interface MoqRow {
  id: string;
  panjang: number;
  lebar: number;
}

export interface TonnageRow {
  id: string;
  panjang: number;
  lebar: number;
  substance: string;
  flute: string;
  quantity: number;
}

export type BoxStyle = 'RSC' | 'FOL' | 'TOP_BOTTOM' | 'DIE_CUT_MAILER';

export interface BoxConverterParams {
  boxLength: number; // P (mm)
  boxWidth: number;  // L (mm)
  boxHeight: number; // T (mm)
  boxStyle: BoxStyle;
  flute: 'B' | 'C' | 'BC' | 'E' | 'CUSTOM';
  jointFlap?: number; // default based on flute or custom
  creaseAllowance?: number; // allowance on width (e.g. +9 for B, +13 for C, +20 for BC)
  overlapFactor?: number;
  customFluteFactor?: number; // for single wall / custom
  customFluteFactor1?: number; // for double wall B layer
  customFluteFactor2?: number; // for double wall C layer
  substance?: string;
  customLayers?: {
    topLiner: number;
    fluteMedium1: number;
    middleLiner?: number;
    fluteMedium2?: number;
    bottomLiner: number;
  };
  calcMode?: 'FACTORY_EXCEL' | 'SYMMETRICAL' | 'CUSTOM';
}

export interface BoxConverterResult {
  sheetLength: number; // P sheet (mm)
  sheetWidth: number;  // L sheet (mm)
  sheetAreaM2: number; // SQM (m2)
  creasingLength: number[]; // e.g. [P, L, P, L, Flap]
  creasingWidth: number[];  // e.g. [TopFlap, Height, BottomFlap]
  boxStyle: BoxStyle;
  description: string;
  
  // Weight and Grammage calculation
  totalGsm: number;
  weightPerBoxKg: number;
  weightPerBoxGram: number;
  fluteFactorUsed: number | string;
  substanceUsed: string;
  
  // Formula breakdown for transparency
  formulaBreakdown: {
    sheetLengthFormula: string;
    sheetWidthFormula: string;
    sqmFormula: string;
    gsmFormula: string;
    weightFormula: string;
  };
}

export interface PaperLayer {
  type: string; // 'top_liner' | 'flute' | 'middle_liner' | 'bottom_liner'
  paperType: string; // 'K' | 'M' | 'WK' | 'TL' | 'D'
  gsm: number;
  pricePerKg: number; // IDR per kg
  takeUpFactor: number;
}

export interface CostSimulationParams {
  sheetLength: number; // mm
  sheetWidth: number;  // mm
  quantity: number;
  wallType?: 'SINGLE_WALL' | 'DOUBLE_WALL' | 'SINGLE_FACE';
  flute?: string;
  layers: PaperLayer[];
  glueCostPerM2: number; // IDR
  conversionCostPerM2: number; // IDR
  wastePercent: number; // e.g. 5%
  marginPercent: number; // e.g. 15%
}

export interface FleetStandard {
  id: 'FSK' | 'FUSO' | 'FUSO_ORI' | 'WINGBOX';
  name: string;
  minTons: number;
  maxTons: number;
  minKg: number;
  maxKg: number;
  label: string;
  description: string;
}

export type FleetStatusType = 'underload' | 'optimal' | 'multiple';

export interface FleetVehicleAnalysis {
  id: 'FSK' | 'FUSO' | 'FUSO_ORI' | 'WINGBOX';
  name: string;
  minTons: number;
  maxTons: number;
  minKg: number;
  maxKg: number;
  status: FleetStatusType;
  statusText: string;
  statusBadge: string;
  truckCount: number;
  truckDisplay: string;
  loadPercentage: number;
  shortageKg: number;
  shortageTons: number;
  advice: string;
  isFitOneTruck: boolean;
}

export interface FleetAnalysisSummary {
  totalTons: number;
  totalKg: number;
  isBelowMinimumDelivery: boolean;
  minimumShortageKg: number;
  minimumShortageTons: number;
  recommendedFleet: FleetVehicleAnalysis | null;
  vehicles: {
    fsk: FleetVehicleAnalysis;
    fuso: FleetVehicleAnalysis;
    fusoOri: FleetVehicleAnalysis;
    wingbox: FleetVehicleAnalysis;
  };
}

export interface FleetTripCalculation {
  fskTrips: number;
  fusoTrips: number;
  fusoOriTrips: number;
  wingboxTrips: number;
  fskMinTrips: number;
  fskMaxTrips: number;
  fusoMinTrips: number;
  fusoMaxTrips: number;
  fusoOriMinTrips: number;
  fusoOriMaxTrips: number;
  wingboxMinTrips: number;
  wingboxMaxTrips: number;
}

export interface CostSimulationResult {
  totalGsm: number;
  paperCostPerM2: number;
  glueCostPerM2: number;
  conversionCostPerM2: number;
  rawProductionCostPerM2: number;
  costWithWastePerM2: number;
  sellingPricePerM2: number;
  
  costPerSheet: number;
  sellingPricePerSheet: number;
  weightPerSheetKg: number;
  
  totalOrderValue: number;
  totalOrderCost: number;
  totalProfit: number;
  totalWeightTons: number;
  
  breakdown: {
    paperPercent: number;
    gluePercent: number;
    conversionPercent: number;
    wastePercent: number;
    marginPercent: number;
  };
}
