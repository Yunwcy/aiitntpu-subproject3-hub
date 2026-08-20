interface MessageGrowthChartProps {
  months: string[];
  totals: number[];
  total: number;
}

const WIDTH = 760;
const HEIGHT = 200;
const PADDING_LEFT = 36;
const PADDING_BOTTOM = 22;
const PADDING_TOP = 12;

export default function MessageGrowthChart({ months, totals, total }: MessageGrowthChartProps) {
  const cumulative: number[] = [];
  totals.reduce((acc, v, i) => {
    cumulative[i] = acc + v;
    return cumulative[i];
  }, 0);

  const max = Math.max(...cumulative);
  const plotWidth = WIDTH - PADDING_LEFT - 8;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const points = cumulative.map((v, i) => {
    const x = PADDING_LEFT + (i / (cumulative.length - 1)) * plotWidth;
    const y = PADDING_TOP + plotHeight - (v / max) * plotHeight;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]!.x},${PADDING_TOP + plotHeight} L ${points[0]!.x},${PADDING_TOP + plotHeight} Z`;

  // Show a sparse set of month labels so the axis doesn't overlap.
  const labelEvery = 4;

  return (
    <div className="card p-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          累積訊息回覆成長（7 家組織 + 自有測試頻道）
        </h3>
        <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
          {total.toLocaleString()}
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-400">
        每月新增回覆數彙整為累積總量；資料為實際 LINE Bot 訊息回覆紀錄。
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full text-brand-500"
        role="img"
        aria-label="累積訊息回覆成長折線圖"
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PADDING_LEFT}
            x2={WIDTH - 8}
            y1={PADDING_TOP + plotHeight * (1 - f)}
            y2={PADDING_TOP + plotHeight * (1 - f)}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth={1}
          />
        ))}
        <text
          x={PADDING_LEFT - 6}
          y={PADDING_TOP + 4}
          textAnchor="end"
          className="fill-slate-400 text-[9px]"
        >
          {max.toLocaleString()}
        </text>
        <text
          x={PADDING_LEFT - 6}
          y={PADDING_TOP + plotHeight}
          textAnchor="end"
          className="fill-slate-400 text-[9px]"
        >
          0
        </text>

        <path d={areaPath} fill="currentColor" fillOpacity={0.12} stroke="none" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth={2} />

        {months.map((m, i) =>
          i % labelEvery === 0 ? (
            <text
              key={m}
              x={points[i]!.x}
              y={HEIGHT - 4}
              textAnchor="middle"
              className="fill-slate-400 text-[9px]"
            >
              {m.slice(2).replace("-", "/")}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
