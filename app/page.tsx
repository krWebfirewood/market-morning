"use client";

import { DisclosureList } from "../src/components/DisclosureList";
import { EventList } from "../src/components/EventList";
import { ExportPanel } from "../src/components/ExportPanel";
import { IndicatorCard } from "../src/components/IndicatorCard";
import { mockSnapshot } from "../src/data/mock-snapshot";
import type { MarketIndicator } from "../src/types/market";

const snapshot = mockSnapshot;

function IndicatorSection({ title, kicker, description, ids }: { title: string; kicker: string; description: string; ids: string[] }) {
  const items = ids.map((id) => snapshot.indicators.find((item) => item.id === id)).filter(Boolean) as MarketIndicator[];
  return (
    <section className="section-block" aria-labelledby={`section-${ids[0]}`}>
      <div className="section-heading"><div><p className="eyebrow">{kicker}</p><h2 id={`section-${ids[0]}`}>{title}</h2></div><p>{description}</p></div>
      <div className="indicator-grid">{items.map((item) => <IndicatorCard key={item.id} indicator={item} />)}</div>
    </section>
  );
}

export default function Home() {
  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("market-morning-theme", next);
  };

  return (
    <main>
      <header className="topbar">
        <a href="#top" className="brand" aria-label="Market Morning 홈"><span className="brand-mark">M</span><span>Market Morning</span></a>
        <nav aria-label="페이지 바로가기"><a href="#markets">시장</a><a href="#events">일정</a><a href="#disclosures">공시</a><a href="#export">내보내기</a></nav>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="라이트 모드와 다크 모드 전환"><span aria-hidden="true">◐</span></button>
      </header>

      <div id="top" className="page-shell">
        <section className="hero">
          <div className="hero-copy">
            <div className="mock-label"><span></span> 정적 프로토타입 · 모의 데이터</div>
            <p className="date-line">2026년 7월 17일 · 금요일</p>
            <h1>출근길<br />시장 브리핑</h1>
            <p className="hero-subtitle">국내 증시 개장 전, 밤사이 시장의 핵심 신호를 5분 안에 차분하게 확인하세요.</p>
          </div>
          <div className="briefing-status">
            <div className="status-orbit"><span className="status-core">준비</span></div>
            <div><p>최근 모의 수집</p><strong>07:30 KST</strong><span className="freshness"><i></i> 16개 지표 모두 정상</span></div>
          </div>
        </section>

        <section className="summary-card" aria-labelledby="summary-title">
          <div className="summary-index">01</div>
          <div><p className="eyebrow">아침 요약 · 규칙 기반</p><h2 id="summary-title">밤사이 시장 한눈에</h2><ol>{snapshot.summary.map((line, index) => <li key={line}><span>0{index + 1}</span>{line}</li>)}</ol></div>
        </section>

        <div id="markets">
          <IndicatorSection title="밤사이 주요 시장" kicker="02 · 위험 선호" description="미국과 국내 시장의 방향, 흐름, 맥락을 함께 확인합니다." ids={["sp500", "nasdaq", "dow", "sox", "kospi"]} />
          <IndicatorSection title="금리와 환율" kicker="03 · 시장 압력" description="자금 조달 비용과 달러 강세, 원화 민감도를 살펴봅니다." ids={["us2y", "us10y", "spread", "usdkrw", "dxy", "usdjpy", "usdcny"]} />
          <IndicatorSection title="원자재와 위험" kicker="04 · 교차 자산" description="에너지, 금속, 변동성으로 시장 위험의 전체 그림을 완성합니다." ids={["wti", "gold", "copper", "vix"]} />
        </div>

        <section id="events" className="section-block anchor-section" aria-labelledby="events-title">
          <div className="section-heading"><div><p className="eyebrow">05 · 오늘의 일정</p><h2 id="events-title">주요 경제 일정</h2></div><p>한국 시간 기준으로 정렬했습니다. 발표 전 실제값은 대기 상태로 표시됩니다.</p></div>
          <EventList events={snapshot.events} />
        </section>

        <section id="disclosures" className="section-block anchor-section" aria-labelledby="disclosures-title">
          <div className="section-heading"><div><p className="eyebrow">06 · 관심 종목</p><h2 id="disclosures-title">최근 공시</h2></div><p>관심 종목에 등록된 기업의 DART 모의 공시입니다.</p></div>
          <DisclosureList disclosures={snapshot.disclosures} />
        </section>

        <section id="export" className="section-block anchor-section" aria-labelledby="export-title">
          <div className="section-heading"><div><p className="eyebrow">07 · 내보내기</p><h2 id="export-title">분석 이어가기</h2></div><p>AI API 연결 없이 투명한 원본 데이터를 내보냅니다.</p></div>
          <ExportPanel snapshot={snapshot} />
        </section>
      </div>

      <footer><div className="footer-brand"><span className="brand-mark">M</span><strong>Market Morning</strong></div><p>이 대시보드는 개인적인 정보 정리를 위한 것이며 투자 조언이 아닙니다. 데이터가 지연되거나 불완전할 수 있으므로 중요한 정보는 공식 출처 또는 이용 중인 증권사에서 다시 확인하세요.</p><span>프로토타입 · 2026</span></footer>
    </main>
  );
}
