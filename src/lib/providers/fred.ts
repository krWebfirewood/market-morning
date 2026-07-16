import type { MarketIndicator, TimeSeriesPoint } from "../../types/market";
import { isMarketDataStale } from "../freshness/business-days";

const FRED_GRAPH_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";

const seriesByIndicator: Record<string, string> = {
  sp500: "SP500",
  nasdaq: "NASDAQCOM",
  dow: "DJIA",
  sox: "NASDAQSOX",
  vix: "VIXCLS",
  us2y: "DGS2",
  us10y: "DGS10",
  usdkrw: "DEXKOUS",
  dxy: "DTWEXBGS",
  usdjpy: "DEXJPUS",
  usdcny: "DEXCHUS",
  wti: "DCOILWTICO",
};

function parseCsv(csv: string): TimeSeriesPoint[] {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, rawValue] = line.split(",");
      return { date, value: Number(rawValue) };
    })
    .filter((point) => point.date && Number.isFinite(point.value))
    .slice(-20);
}

export async function fetchFredSeries(
  indicatorId: string,
): Promise<{ seriesId: string; points: TimeSeriesPoint[] }> {
  const seriesId = seriesByIndicator[indicatorId];
  if (!seriesId) throw new Error(`FRED 계열이 없는 지표입니다: ${indicatorId}`);

  const response = await fetch(`${FRED_GRAPH_URL}?id=${seriesId}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`FRED ${seriesId} 응답 오류: ${response.status}`);

  const points = parseCsv(await response.text());
  if (points.length < 2) throw new Error(`FRED ${seriesId} 유효 관측값 부족`);
  return { seriesId, points };
}

function classifyStatus(
  category: MarketIndicator["category"],
  value: number,
  changePercent: number | null,
): MarketIndicator["status"] {
  if (category === "volatility") return value >= 25 ? "elevated-risk" : "normal";
  const change = changePercent ?? 0;
  if (change >= 0.4) return "rise";
  if (change <= -0.4) return "fall";
  return "stable";
}

export function applyFredSeries(
  base: MarketIndicator,
  seriesId: string,
  points: TimeSeriesPoint[],
): MarketIndicator {
  const current = points.at(-1)!;
  const previous = points.at(-2)!;
  const change = Number((current.value - previous.value).toFixed(4));
  const changePercent = base.category === "rate" || base.id === "spread"
    ? null
    : Number(((change / previous.value) * 100).toFixed(2));
  const isStale = isMarketDataStale(current.date, base.category);
  const interpretation = base.category === "rate"
    ? `${base.shortName} 금리가 직전 관측값보다 ${change >= 0 ? "상승" : "하락"}했습니다.`
    : base.category === "fx"
      ? `${base.shortName} 환율이 직전 관측값보다 ${change >= 0 ? "상승" : "하락"}했습니다.`
      : base.category === "volatility"
        ? `변동성 지수는 ${current.value >= 25 ? "경계가 필요한 수준" : "정상 범위"}입니다.`
        : `${base.shortName}은 직전 거래일보다 ${change >= 0 ? "상승" : "하락"}했습니다.`;

  return {
    ...base,
    value: current.value,
    previousValue: previous.value,
    change,
    changePercent,
    status: isStale ? "stale" : classifyStatus(base.category, current.value, changePercent),
    interpretation,
    source: `FRED · ${seriesId}`,
    sourceUrl: `https://fred.stlouisfed.org/series/${seriesId}`,
    asOf: `${current.date}T23:59:59+09:00`,
    isStale,
    recentSeries: points,
  };
}
