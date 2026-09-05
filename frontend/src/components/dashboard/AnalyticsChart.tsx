type AnalyticsChartProps = {
  values: number[];
  color: string;
  fill?: string;
};

export default function AnalyticsChart({ values, color, fill = "transparent" }: AnalyticsChartProps) {
  const max = Math.max(...values);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${90 - (value / max) * 72}`)
    .join(" ");
  const areaPoints = `0,90 ${points} 100,90`;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 block h-full w-full overflow-hidden" role="img" aria-label="Analytics trend chart">
      <path d={`M ${areaPoints}`} fill={fill} opacity="0.18" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
