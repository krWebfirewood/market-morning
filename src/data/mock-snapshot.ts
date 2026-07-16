import type { MarketIndicator, MorningMarketSnapshot } from "../types/market";

const dates = [
  "2026-06-19", "2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25",
  "2026-06-26", "2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02",
  "2026-07-06", "2026-07-07", "2026-07-08", "2026-07-09", "2026-07-10",
  "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17",
];

function series(values: number[]) {
  return values.map((value, index) => ({ date: dates[index], value }));
}

function indicator(
  input: Omit<MarketIndicator, "asOf" | "isStale" | "recentSeries"> & { values: number[] },
): MarketIndicator {
  const { values, ...item } = input;
  return {
    ...item,
    asOf: "2026-07-17T07:20:00+09:00",
    isStale: false,
    recentSeries: series(values),
  };
}

const indicators: MarketIndicator[] = [
  indicator({ id: "sp500", name: "S&P 500", shortName: "S&P 500", category: "equity", value: 6250.12, previousValue: 6223.98, change: 26.14, changePercent: 0.42, unit: "", status: "rise", interpretation: "미국 대표 지수가 완만하게 상승 마감했습니다.", source: "모의 시장 데이터", values: [6101,6122,6116,6150,6168,6172,6194,6188,6204,6219,6201,6228,6235,6218,6240,6231,6226,6219,6224,6250.12] }),
  indicator({ id: "nasdaq", name: "나스닥 종합", shortName: "나스닥", category: "equity", value: 20485.31, previousValue: 20308.65, change: 176.66, changePercent: 0.87, unit: "", status: "rise", interpretation: "기술주가 미국 대표 지수보다 강한 흐름을 보였습니다.", source: "모의 시장 데이터", values: [19810,19920,19870,20005,20110,20080,20190,20095,20222,20310,20190,20280,20350,20210,20370,20320,20270,20225,20308.65,20485.31] }),
  indicator({ id: "dow", name: "다우존스", shortName: "다우", category: "equity", value: 44710.21, previousValue: 44639.12, change: 71.09, changePercent: 0.16, unit: "", status: "stable", interpretation: "대형 산업주는 보합권에서 마감했습니다.", source: "모의 시장 데이터", values: [43800,43920,44010,44120,44060,44210,44170,44300,44260,44340,44200,44410,44360,44490,44510,44480,44530,44590,44639.12,44710.21] }),
  indicator({ id: "sox", name: "반도체 지수 대용", shortName: "반도체", category: "equity", value: 5680.22, previousValue: 5606.21, change: 74.01, changePercent: 1.32, unit: "", status: "rise", interpretation: "밤사이 반도체 투자 심리가 강했습니다.", source: "모의 시장 데이터", values: [5320,5380,5355,5410,5455,5430,5490,5510,5480,5535,5500,5550,5580,5540,5595,5610,5585,5570,5606.21,5680.22] }),
  indicator({ id: "kospi", name: "코스피", shortName: "코스피", category: "equity", value: 3214.55, previousValue: 3198.77, change: 15.78, changePercent: 0.49, unit: "", status: "rise", interpretation: "직전 국내 거래일은 상승 마감했습니다.", source: "모의 KRX", values: [3070,3090,3082,3110,3125,3130,3120,3140,3155,3148,3160,3172,3165,3180,3190,3182,3195,3202,3198.77,3214.55] }),
  indicator({ id: "kosdaq", name: "코스닥", shortName: "코스닥", category: "equity", value: 842.18, previousValue: 838.42, change: 3.76, changePercent: 0.45, unit: "", status: "rise", interpretation: "직전 국내 거래일 코스닥은 상승 마감했습니다.", source: "모의 KRX", values: [812,818,815,821,824,826,823,829,832,830,834,836,833,838,840,837,839,841,838.42,842.18] }),
  indicator({ id: "us2y", name: "미국 국채 2년물", shortName: "미 국채 2년", category: "rate", value: 4.12, previousValue: 4.09, change: 0.03, changePercent: null, unit: "%", status: "rise", interpretation: "단기 금리가 3bp 상승했습니다.", source: "모의 FRED", values: [4.02,4.04,4.01,4.05,4.06,4.04,4.07,4.08,4.05,4.06,4.08,4.09,4.07,4.10,4.08,4.09,4.11,4.10,4.09,4.12] }),
  indicator({ id: "us10y", name: "미국 국채 10년물", shortName: "미 국채 10년", category: "rate", value: 4.36, previousValue: 4.28, change: 0.08, changePercent: null, unit: "%", status: "rise", interpretation: "장기 금리가 8bp 올라 성장주에 부담이 될 수 있습니다.", source: "모의 FRED", values: [4.18,4.20,4.17,4.21,4.22,4.19,4.23,4.25,4.22,4.24,4.25,4.27,4.24,4.26,4.29,4.27,4.30,4.29,4.28,4.36] }),
  indicator({ id: "spread", name: "10년-2년 금리차", shortName: "10년-2년", category: "rate", value: 24, previousValue: 19, change: 5, changePercent: null, unit: " bp", status: "rise", interpretation: "장단기 금리차가 5bp 확대됐습니다.", source: "계산된 모의 데이터", values: [16,16,16,16,16,15,16,17,17,18,17,18,17,16,21,18,19,19,19,24] }),
  indicator({ id: "usdkrw", name: "원/달러 환율", shortName: "USD/KRW", category: "fx", value: 1385.2, previousValue: 1375.8, change: 9.4, changePercent: 0.68, unit: "", status: "rise", interpretation: "원화 약세로 외국인 수급 민감도가 높아질 수 있습니다.", source: "모의 ECOS", values: [1358,1362,1360,1368,1370,1367,1372,1375,1371,1369,1374,1378,1376,1380,1377,1379,1381,1378,1375.8,1385.2] }),
  indicator({ id: "dxy", name: "달러 인덱스", shortName: "DXY", category: "fx", value: 104.2, previousValue: 103.88, change: 0.32, changePercent: 0.31, unit: "", status: "rise", interpretation: "미 달러가 완만하게 강세를 보였습니다.", source: "모의 시장 데이터", values: [102.9,103.1,103.0,103.2,103.3,103.1,103.4,103.5,103.3,103.4,103.5,103.7,103.6,103.8,103.7,103.9,103.8,103.9,103.88,104.2] }),
  indicator({ id: "usdjpy", name: "달러/엔 환율", shortName: "USD/JPY", category: "fx", value: 158.4, previousValue: 157.58, change: 0.82, changePercent: 0.52, unit: "", status: "rise", interpretation: "엔화가 미 달러 대비 약세를 보였습니다.", source: "모의 시장 데이터", values: [155.1,155.6,155.4,156.0,156.2,155.8,156.5,156.8,156.4,156.9,157.1,157.4,157.0,157.6,157.3,157.8,157.5,157.7,157.58,158.4] }),
  indicator({ id: "usdcny", name: "달러/위안 환율", shortName: "USD/CNY", category: "fx", value: 7.19, previousValue: 7.18, change: 0.01, changePercent: 0.14, unit: "", status: "stable", interpretation: "위안화는 대체로 보합권이었습니다.", source: "모의 시장 데이터", values: [7.16,7.17,7.16,7.17,7.18,7.17,7.18,7.19,7.18,7.18,7.17,7.18,7.18,7.19,7.18,7.18,7.19,7.18,7.18,7.19] }),
  indicator({ id: "wti", name: "WTI 원유", shortName: "WTI", category: "commodity", value: 76.2, previousValue: 77.06, change: -0.86, changePercent: -1.12, unit: " USD", status: "fall", interpretation: "최근 상승 뒤 국제 유가가 하락했습니다.", source: "모의 시장 데이터", values: [73.2,74.1,73.8,74.5,75.0,74.6,75.2,75.8,75.4,76.0,75.7,76.4,76.8,76.2,77.0,76.7,77.3,76.9,77.06,76.2] }),
  indicator({ id: "gold", name: "금", shortName: "금", category: "commodity", value: 2430, previousValue: 2420.8, change: 9.2, changePercent: 0.38, unit: " USD", status: "stable", interpretation: "금리와 달러 상승에도 금 가격은 견조했습니다.", source: "모의 시장 데이터", values: [2380,2392,2388,2401,2398,2405,2410,2402,2415,2418,2410,2422,2417,2425,2420,2428,2422,2418,2420.8,2430] }),
  indicator({ id: "copper", name: "구리", shortName: "구리", category: "commodity", value: 4.52, previousValue: 4.49, change: 0.03, changePercent: 0.7, unit: " USD", status: "rise", interpretation: "산업용 금속 가격이 상승했습니다.", source: "모의 시장 데이터", values: [4.32,4.35,4.33,4.38,4.40,4.37,4.41,4.43,4.40,4.44,4.42,4.46,4.45,4.48,4.47,4.49,4.46,4.48,4.49,4.52] }),
  indicator({ id: "vix", name: "CBOE 변동성 지수", shortName: "VIX", category: "volatility", value: 16.8, previousValue: 17.34, change: -0.54, changePercent: -3.1, unit: "", status: "normal", interpretation: "시장 변동성은 정상 범위에 있습니다.", source: "모의 FRED", values: [18.2,17.8,18.5,17.9,17.2,17.6,17.0,16.8,17.1,16.5,17.3,16.9,17.2,16.7,17.0,16.8,17.1,17.5,17.34,16.8] }),
];

export const mockSnapshot: MorningMarketSnapshot = {
  generatedAt: "2026-07-17T07:30:00+09:00",
  marketDate: "2026-07-17",
  collectionStatus: "success",
  summary: [
    "미국 증시와 반도체 종목이 밤사이 상승 마감했습니다.",
    "미 국채 금리와 원/달러 환율도 올라 국내 성장주의 변동성이 커질 수 있습니다.",
    "오늘 가장 중요한 일정은 21시 30분 미국 소매판매 발표입니다.",
  ],
  indicators,
  events: [
    { id: "bok", dateTimeKst: "2026-07-17T10:00:00+09:00", country: "한국", title: "한국은행 통화정책방향 의사록", importance: 2, source: "모의 한국은행", sourceUrl: "https://www.bok.or.kr" },
    { id: "ecb", dateTimeKst: "2026-07-17T18:00:00+09:00", country: "유럽", title: "유로존 소비자물가지수 확정치", importance: 2, previous: "2.0%", consensus: "2.0%", source: "모의 Eurostat", sourceUrl: "https://ec.europa.eu/eurostat" },
    { id: "retail", dateTimeKst: "2026-07-17T21:30:00+09:00", country: "미국", title: "소매판매 전월 대비", importance: 3, previous: "-0.9%", consensus: "0.1%", source: "모의 미국 인구조사국", sourceUrl: "https://www.census.gov" },
  ],
  disclosures: [
    { id: "d1", companyName: "삼성전자", ticker: "005930", corpCode: "00126380", title: "자기주식 취득 결정 보고", filedAt: "2026-07-16T17:42:00+09:00", sourceUrl: "https://dart.fss.or.kr" },
    { id: "d2", companyName: "SK하이닉스", ticker: "000660", corpCode: "00164779", title: "기업설명회 개최 안내", filedAt: "2026-07-16T16:18:00+09:00", sourceUrl: "https://dart.fss.or.kr" },
  ],
  errors: [],
};
