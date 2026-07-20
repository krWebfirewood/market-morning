import type { MarketIndicator, MorningMarketSnapshot } from "../../types/market";

function signed(value: number | null, suffix = "") {
  if (value === null) return "데이터 없음";
  return `${value > 0 ? "+" : ""}${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}${suffix}`;
}

function indicatorLine(item: MarketIndicator) {
  if (item.value === null) return `- ${item.name}: 미수집 (${item.source})`;
  const value = `${item.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${item.unit}`;
  const change = item.changePercent !== null
    ? `일간 변동 ${signed(item.changePercent, "%")}`
    : `일간 변동 ${signed(item.change, item.unit)}`;
  return `- ${item.name}: ${value}, ${change} · 출처 ${item.source}${item.isStale ? " · 지연" : ""}`;
}

export function snapshotToMarkdown(snapshot: MorningMarketSnapshot) {
  const group = (categories: MarketIndicator["category"][]) =>
    snapshot.indicators.filter((item) => categories.includes(item.category));

  const sections = [
    ["밤사이 주요 시장", group(["equity", "volatility"])],
    ["금리", group(["rate"])],
    ["환율", group(["fx"])],
    ["원자재", group(["commodity"])],
  ] as const;

  const lines = [
    "# Market Morning 데이터",
    "",
    `생성 시각: ${snapshot.generatedAt.replace("T", " ").replace("+09:00", " KST")}`,
    "",
    "> 실제 수집값과 미수집 항목을 구분합니다. 중요한 수치는 공식 출처에서 다시 확인하세요.",
    "",
    "## 아침 요약",
    ...snapshot.summary.map((line) => `- ${line}`),
  ];

  for (const [title, indicators] of sections) {
    lines.push("", `## ${title}`, ...indicators.map(indicatorLine));
  }

  lines.push(
    "",
    "## 오늘의 주요 일정",
    ...(snapshot.events.length ? snapshot.events.map((event) =>
      `- ${event.dateTimeKst.slice(11, 16)} KST: ${event.title}, 중요도 ${event.importance}`,
    ) : ["- 연결된 일정 데이터 없음"]),
    "",
    "## 관심 종목 공시",
    ...(snapshot.disclosures.length
      ? snapshot.disclosures.map(
          (item) => `- ${item.companyName}: ${item.title} (${item.filedAt.slice(0, 16).replace("T", " ")} KST)`,
        )
      : ["- 새 공시 없음"]),
    "",
    "## 분석 요청 예시",
    "위 데이터가 한국 주식시장에 미칠 가능성 있는 영향을 분석해 주세요.",
    "긍정 요인과 부정 요인을 나누고, 제공된 데이터에 없는 정보는 만들지 마세요.",
  );

  return lines.join("\n");
}
