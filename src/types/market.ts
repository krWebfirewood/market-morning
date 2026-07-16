export type IndicatorCategory =
  | "equity"
  | "volatility"
  | "rate"
  | "fx"
  | "commodity"
  | "flow";

export type IndicatorStatus =
  | "strong-rise"
  | "rise"
  | "stable"
  | "fall"
  | "strong-fall"
  | "elevated-risk"
  | "normal"
  | "stale"
  | "unavailable";

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface MarketIndicator {
  id: string;
  name: string;
  shortName: string;
  category: IndicatorCategory;
  value: number | null;
  unit: string;
  previousValue: number | null;
  change: number | null;
  changePercent: number | null;
  status: IndicatorStatus;
  interpretation: string;
  source: string;
  sourceUrl?: string;
  asOf: string;
  isStale: boolean;
  recentSeries: TimeSeriesPoint[];
}

export interface EconomicEvent {
  id: string;
  dateTimeKst: string;
  country: string;
  title: string;
  importance: 1 | 2 | 3;
  previous?: string;
  consensus?: string;
  actual?: string;
  source: string;
  sourceUrl?: string;
}

export interface DisclosureItem {
  id: string;
  companyName: string;
  ticker?: string;
  corpCode?: string;
  title: string;
  filedAt: string;
  reportCode?: string;
  sourceUrl: string;
}

export interface DataCollectionError {
  provider: string;
  message: string;
  occurredAt: string;
}

export interface MorningMarketSnapshot {
  generatedAt: string;
  marketDate: string;
  collectionStatus: "success" | "partial" | "failed";
  summary: string[];
  indicators: MarketIndicator[];
  events: EconomicEvent[];
  disclosures: DisclosureItem[];
  errors: DataCollectionError[];
}
