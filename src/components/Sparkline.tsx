import type { TimeSeriesPoint } from "../types/market";

export function Sparkline({ data, label }: { data: TimeSeriesPoint[]; label: string }) {
  const points = data.slice(-5);
  if (points.length < 2) return <span className="sparkline-empty">추세 데이터 없음</span>;

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = points.map((point, index) => ({
    x: 4 + (index / (points.length - 1)) * 112,
    y: 37 - ((point.value - min) / range) * 30,
  }));
  const path = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const last = coords.at(-1)!;

  return (
    <svg className="sparkline" viewBox="0 0 120 44" role="img" aria-label={`${label}, 최근 5개 세션: ${values.join(", ")}`}>
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="3.5" fill="currentColor" />
    </svg>
  );
}
