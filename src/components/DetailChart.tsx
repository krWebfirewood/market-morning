"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MarketIndicator } from "../types/market";

export function DetailChart({ indicator }: { indicator: MarketIndicator }) {
  const values = indicator.recentSeries.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="detail-chart" aria-label={`${indicator.name} 1개월 선 차트`}>
      <div className="chart-stats">
        <span>1개월 최저 <strong>{min.toLocaleString("ko-KR")}{indicator.unit}</strong></span>
        <span>1개월 최고 <strong>{max.toLocaleString("ko-KR")}{indicator.unit}</strong></span>
      </div>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={indicator.recentSeries} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tick={{ fontSize: 10 }} interval={5} axisLine={false} tickLine={false} />
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Tooltip formatter={(value) => [`${Number(value).toLocaleString("en-US")}${indicator.unit}`, indicator.shortName]} labelFormatter={(label) => String(label)} contentStyle={{ borderRadius: 12, borderColor: "var(--border)", background: "var(--surface)" }} />
            <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} fill={`url(#fill-${indicator.id})`} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-summary">최근 한 달간 {indicator.shortName}은 {min.toLocaleString("ko-KR")}~{max.toLocaleString("ko-KR")}{indicator.unit} 범위였습니다. 현재값: {indicator.value?.toLocaleString("ko-KR") ?? "데이터 없음"}{indicator.unit}.</p>
    </div>
  );
}
