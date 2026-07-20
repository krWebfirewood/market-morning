import type { MarketIndicator, TimeSeriesPoint } from "../../types/market";
import cachedFredSnapshot from "../../data/fred-snapshot.json";
import { isMarketDataStale } from "../freshness/business-days";

const FRED_GRAPH_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";
const FRED_API_URL = "https://api.stlouisfed.org/fred/series/observations";

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

const cachedSeries = cachedFredSnapshot.series as Record<string, TimeSeriesPoint[]>;

export function parseFredBatchCsv(csv: string) {
  const [header = "", ...rows] = csv.trim().split(/\r?\n/);
  const seriesIds = header.split(",").slice(1);
  return Object.fromEntries(seriesIds.map((seriesId, columnIndex) => {
    const points = rows.map((line) => {
      const columns = line.split(",");
      const rawValue = columns[columnIndex + 1]?.trim();
      return { date: columns[0], value: rawValue ? Number(rawValue) : Number.NaN };
    }).filter((point) => point.date && Number.isFinite(point.value)).slice(-20);
    return [seriesId, points];
  })) as Record<string, TimeSeriesPoint[]>;
}

async function fetchFredCsv(url: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        headers: {
          Accept: "text/csv,text/plain;q=0.9,*/*;q=0.8",
          "User-Agent": "MarketMorning/1.0 (market data dashboard)",
        },
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) throw new Error(`FRED 응답 오류: ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

interface FredApiResponse {
  observations?: Array<{ date: string; value: string }>;
  error_message?: string;
}

async function fetchFredApiSeries(seriesId: string, start: string, end: string) {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    observation_start: start,
    observation_end: end,
    sort_order: "asc",
  });
  const response = await fetch(`${FRED_API_URL}?${params}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(12_000),
  });
  const payload = (await response.json()) as FredApiResponse;
  if (!response.ok) throw new Error(payload.error_message ?? `FRED API 응답 오류: ${response.status}`);
  return (payload.observations ?? [])
    .map((item) => ({ date: item.date, value: Number(item.value) }))
    .filter((point) => point.date && Number.isFinite(point.value))
    .slice(-20);
}

export async function fetchFredSeriesBatch(indicatorIds: string[]) {
  const pairs = indicatorIds.map((indicatorId) => {
    const seriesId = seriesByIndicator[indicatorId];
    if (!seriesId) throw new Error(`FRED 계열이 없는 지표입니다: ${indicatorId}`);
    return { indicatorId, seriesId };
  });
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 75);
  const data: Array<{ indicatorId: string; seriesId: string; points: TimeSeriesPoint[] }> = [];
  const errors: Array<{ indicatorId: string; error: unknown }> = [];
  if (process.env.VERCEL && !process.env.FRED_API_KEY) {
    pairs.forEach(({ indicatorId, seriesId }) => {
      const points = cachedSeries[seriesId] ?? [];
      if (points.length >= 2) data.push({ indicatorId, seriesId, points });
      else errors.push({ indicatorId, error: new Error(`FRED ${seriesId} 저장 스냅샷 없음`) });
    });
    return { data, errors };
  }
  const results = await Promise.allSettled(pairs.map(async ({ indicatorId, seriesId }) => {
      const startDate = start.toISOString().slice(0, 10);
      const endDate = end.toISOString().slice(0, 10);
      const apiPoints = await fetchFredApiSeries(seriesId, startDate, endDate);
      const params = new URLSearchParams({
        id: seriesId,
        cosd: startDate,
        coed: endDate,
      });
      const points = apiPoints ?? parseFredBatchCsv(await fetchFredCsv(`${FRED_GRAPH_URL}?${params}`))[seriesId] ?? [];
      if (points.length < 2) throw new Error(`FRED ${seriesId} 유효 관측값 부족`);
      return { indicatorId, seriesId, points };
    }));
  results.forEach((result, resultIndex) => {
      if (result.status === "fulfilled") data.push(result.value);
      else errors.push({ indicatorId: pairs[resultIndex].indicatorId, error: result.reason });
  });
  return { data, errors };
}

export async function fetchFredSeries(
  indicatorId: string,
): Promise<{ seriesId: string; points: TimeSeriesPoint[] }> {
  const result = await fetchFredSeriesBatch([indicatorId]);
  if (!result.data.length) throw result.errors[0]?.error ?? new Error(`FRED ${indicatorId} 수집 실패`);
  const [{ seriesId, points }] = result.data;
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
  now = new Date(),
): MarketIndicator {
  const current = points.at(-1)!;
  const previous = points.at(-2)!;
  const change = Number((current.value - previous.value).toFixed(4));
  const changePercent = base.category === "rate" || base.id === "spread"
    ? null
    : Number(((change / previous.value) * 100).toFixed(2));
  const isStale = isMarketDataStale(current.date, base.category, now);
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
