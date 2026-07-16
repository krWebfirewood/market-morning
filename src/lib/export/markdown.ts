import type { MarketIndicator, MorningMarketSnapshot } from "../../types/market";

function signed(value: number | null, suffix = "") {
  if (value === null) return "데이터 없음";
  return `${value > 0 ? "+" : ""}${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}${suffix}`;
}

function indicatorLine(item: MarketIndicator) {
  if (item.value === null) return `- ${item.name}: 데이터 없음`;
  const value = `${item.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${item.unit}`;
  const change = item.changePercent !== null
    ? `일간 변동 ${signed(item.changePercent, "%")}`
    : `일간 변동 ${signed(item.change, item.unit)}`;
  return `- ${item.name}: ${value}, ${change}`;
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
    "> UI 개발용 모의 데이터입니다. 사용 전 모든 수치를 확인하세요.",
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
    ...snapshot.events.map((event) =>
      `- ${event.dateTimeKst.slice(11, 16)} KST: ${event.title}, 중요도 ${event.importance}`,
    ),
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
