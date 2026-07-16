"use client";

import type { MarketIndicator, MorningMarketSnapshot } from "../types/market";
import { DisclosureList } from "./DisclosureList";
import { EventList } from "./EventList";
import { ExportPanel } from "./ExportPanel";
import { IndicatorCard } from "./IndicatorCard";

function IndicatorSection({ snapshot, title, kicker, description, ids }: { snapshot: MorningMarketSnapshot; title: string; kicker: string; description: string; ids: string[] }) {
  const items = ids.map((id) => snapshot.indicators.find((item) => item.id === id)).filter(Boolean) as MarketIndicator[];
  return <section className="section-block" aria-labelledby={`section-${ids[0]}`}><div className="section-heading"><div><p className="eyebrow">{kicker}</p><h2 id={`section-${ids[0]}`}>{title}</h2></div><p>{description}</p></div><div className="indicator-grid">{items.map((item) => <IndicatorCard key={item.id} indicator={item} />)}</div></section>;
}

export function Dashboard({ snapshot }: { snapshot: MorningMarketSnapshot }) {
  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("market-morning-theme", next);
  };
  const liveCount = snapshot.indicators.filter((item) => item.source.startsWith("FRED")).length;
  const date = new Intl.DateTimeFormat("ko-KR", { dateStyle: "full", timeZone: "Asia/Seoul" }).format(new Date(snapshot.generatedAt));

  return <main>
    <header className="topbar"><a href="#top" className="brand" aria-label="Market Morning 홈"><span className="brand-mark">M</span><span>Market Morning</span></a><nav aria-label="페이지 바로가기"><a href="#markets">시장</a><a href="#events">일정</a><a href="#disclosures">공시</a><a href="#export">내보내기</a></nav><button className="theme-toggle" onClick={toggleTheme} aria-label="라이트 모드와 다크 모드 전환"><span aria-hidden="true">◐</span></button></header>
    <div id="top" className="page-shell">
      <section className="hero"><div className="hero-copy"><div className="mock-label live-label"><span></span> FRED 실데이터 · 일부 모의 데이터</div><p className="date-line">{date}</p><h1>출근길<br />시장 브리핑</h1><p className="hero-subtitle">국내 증시 개장 전, 밤사이 시장의 핵심 신호를 5분 안에 차분하게 확인하세요.</p></div><div className="briefing-status"><div className="status-orbit"><span className="status-core">수집</span></div><div><p>최근 서버 수집</p><strong>{snapshot.generatedAt.slice(11, 16)} KST</strong><span className="freshness"><i></i> FRED {liveCount}개 · 대체 {snapshot.indicators.length - liveCount}개</span></div></div></section>
      {snapshot.errors.length > 0 && <aside className="data-notice" role="status">일부 데이터 수집에 실패해 마지막 모의 값을 표시합니다. 각 카드의 출처와 지연 표시를 확인하세요.</aside>}
      <section className="summary-card" aria-labelledby="summary-title"><div className="summary-index">01</div><div><p className="eyebrow">아침 요약 · 규칙 기반</p><h2 id="summary-title">밤사이 시장 한눈에</h2><ol>{snapshot.summary.map((line, index) => <li key={line}><span>0{index + 1}</span>{line}</li>)}</ol></div></section>
      <div id="markets"><IndicatorSection snapshot={snapshot} title="밤사이 주요 시장" kicker="02 · 위험 선호" description="미국과 국내 시장의 방향, 흐름, 맥락을 함께 확인합니다." ids={["sp500", "nasdaq", "dow", "sox", "kospi"]} /><IndicatorSection snapshot={snapshot} title="금리와 환율" kicker="03 · 시장 압력" description="자금 조달 비용과 달러 강세, 원화 민감도를 살펴봅니다." ids={["us2y", "us10y", "spread", "usdkrw", "dxy", "usdjpy", "usdcny"]} /><IndicatorSection snapshot={snapshot} title="원자재와 위험" kicker="04 · 교차 자산" description="에너지, 금속, 변동성으로 시장 위험의 전체 그림을 완성합니다." ids={["wti", "gold", "copper", "vix"]} /></div>
      <section id="events" className="section-block anchor-section" aria-labelledby="events-title"><div className="section-heading"><div><p className="eyebrow">05 · 오늘의 일정</p><h2 id="events-title">주요 경제 일정</h2></div><p>Milestone 4 전까지 일정은 모의 데이터입니다.</p></div><EventList events={snapshot.events} /></section>
      <section id="disclosures" className="section-block anchor-section" aria-labelledby="disclosures-title"><div className="section-heading"><div><p className="eyebrow">06 · 관심 종목</p><h2 id="disclosures-title">최근 공시</h2></div><p>DART 연결 전까지 공시는 모의 데이터입니다.</p></div><DisclosureList disclosures={snapshot.disclosures} /></section>
      <section id="export" className="section-block anchor-section" aria-labelledby="export-title"><div className="section-heading"><div><p className="eyebrow">07 · 내보내기</p><h2 id="export-title">분석 이어가기</h2></div><p>현재 화면의 실제·대체 데이터를 구분한 스냅샷을 내보냅니다.</p></div><ExportPanel snapshot={snapshot} /></section>
    </div>
    <footer><div className="footer-brand"><span className="brand-mark">M</span><strong>Market Morning</strong></div><p>이 대시보드는 개인적인 정보 정리를 위한 것이며 투자 조언이 아닙니다. 데이터가 지연되거나 불완전할 수 있으므로 중요한 정보는 공식 출처 또는 이용 중인 증권사에서 다시 확인하세요.</p><span>FRED 연동 · 2026</span></footer>
  </main>;
}
