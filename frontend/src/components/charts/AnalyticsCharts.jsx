import { memo } from "react";

function normalizeSeries(series, width, height, padding) {
  if (!series?.length) return [];
  const max = Math.max(...series.map((value) => Number(value) || 0), 1);
  const min = Math.min(...series.map((value) => Number(value) || 0), 0);
  const range = Math.max(max - min, 1);
  return series.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(series.length - 1, 1);
    const y = height - padding - (((Number(value) || 0) - min) / range) * (height - padding * 2);
    return { x, y, value: Number(value) || 0 };
  });
}

export function LineChart({ title, data = [], color = "#e85d26", subtitle }) {
  const width = 320;
  const height = 140;
  const points = normalizeSeries(data, width, height, 16);
  const path = points.map((p, index) => `${index === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="rounded-3xl border border-white/10 bg-ipl-panel/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{title}</p>
          {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
        </div>
        <span className="text-xs text-gray-400">{data.length} seasons</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-36 w-full overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3" fill={color} />
        ))}
      </svg>
    </div>
  );
}

export function BarChart({ title, data = [], color = "#22b8d9", subtitle }) {
  const width = 320;
  const max = Math.max(...data.map((value) => Number(value) || 0), 1);
  const barWidth = Math.max(24, width / Math.max(data.length, 5) - 8);

  return (
    <div className="rounded-3xl border border-white/10 bg-ipl-panel/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{title}</p>
          {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
        </div>
        <span className="text-xs text-gray-400">{data.length} seasons</span>
      </div>
      <div className="mt-4 flex items-end gap-2 h-36">
        {data.map((value, index) => {
          const heightPct = Math.max(4, ((Number(value) || 0) / max) * 100);
          return (
            <div key={index} className="flex-1 text-center">
              <div
                className="mx-auto rounded-full transition-all duration-200"
                style={{
                  width: `${barWidth}px`,
                  height: `${heightPct}%`,
                  background: color,
                  minHeight: 14,
                }}
              />
              <p className="mt-2 text-[10px] text-gray-400">{index + 1}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrendCard({ title, value, change, description }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-4 shadow-sm transition hover:-translate-y-1 duration-200">
      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
      {change !== undefined && (
        <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${change >= 0 ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
          {change >= 0 ? `+${change}%` : `${change}%`}
        </span>
      )}
    </div>
  );
}

export const MemoizedLineChart = memo(LineChart);
export const MemoizedBarChart = memo(BarChart);
export const MemoizedTrendCard = memo(TrendCard);
