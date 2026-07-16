"use client";

import { useState } from "react";
import type { MarketIndicator } from "../types/market";
import { DetailChart } from "./DetailChart";
import { Sparkline } from "./Sparkline";

const statusLabels: Record<MarketIndicator["status"], string> = {
  "strong-rise": "상승", rise: "상승", stable: "보합", fall: "하락",
  "strong-fall": "하락", "elevated-risk": "위험 상승", normal: "정상 범위",
  stale: "데이터 지연", unavailable: "데이터 없음",
};

const categoryLabels: Record<MarketIndicator["category"], string> = {
  equity: "주식", volatility: "변동성", rate: "금리", fx: "환율", commodity: "원자재", flow: "수급",
};

export function IndicatorCard({ indicator }: { indicator: MarketIndicator }) {
  const [expanded, setExpanded] = useState(false);
  const positive = (indicator.change ?? 0) > 0;
  const negative = (indicator.change ?? 0) < 0;
  const direction = positive ? "↑" : negative ? "↓" : "→";
  const formattedValue = indicator.value === null ? "—" : indicator.value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const change = indicator.change === null ? "데이터 없음" : `${positive ? "+" : ""}${indicator.change.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}${indicator.unit}`;
  const percent = indicator.changePercent === null ? "" : ` · ${positive ? "+" : ""}${indicator.changePercent.toFixed(2)}%`;

  return (
    <article className={`indicator-card status-${indicator.status}`}>
      <button className="card-main" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls={`detail-${indicator.id}`}>
        <div className="card-heading">
          <div>
            <p className="eyebrow">{categoryLabels[indicator.category]}</p>
            <h3>{indicator.shortName}</h3>
          </div>
          <span className={`status-pill status-${indicator.status}`}>{statusLabels[indicator.status]}</span>
        </div>
        <div className="card-value-row">
          <div>
            <p className="card-value">{formattedValue}<span>{indicator.unit}</span></p>
            <p className={`change ${positive ? "up" : negative ? "down" : "flat"}`}><span aria-hidden="true">{direction}</span> {change}{percent}</p>
          </div>
          <Sparkline data={indicator.recentSeries} label={indicator.name} />
        </div>
        <p className="interpretation">{indicator.interpretation}</p>
        <div className="card-footer"><span>{indicator.source}</span><span>{indicator.asOf.slice(11, 16)} KST</span><span>{expanded ? "접기 −" : "1개월 상세 +"}</span></div>
      </button>
      {expanded && <div id={`detail-${indicator.id}`} className="card-detail"><DetailChart indicator={indicator} /></div>}
    </article>
  );
}
