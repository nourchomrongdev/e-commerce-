type AnalyticsChartProps = {
  values?: number[];
  color?: string;
  fill?: string;
};

const defaultValues = [18, 26, 22, 35, 30, 42, 38, 48];

export default function AnalyticsChart({ values = defaultValues, color = "#ff7a36", fill = "#ff7a36" }: AnalyticsChartProps) {
  const max = Math.max(...values, 1);
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
