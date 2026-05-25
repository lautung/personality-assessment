function polarPoint(index, total, value, chartSize) {
  const center = chartSize / 2;
  const radius = (chartSize * 0.38 * value) / 100;
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / total;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

export default function RadarChart({ scores, compact = false, ariaLabel = "人格评估雷达图" }) {
  const chartSize = compact ? 190 : 250;
  const padding = 16;
  const size = chartSize + padding * 2;
  const center = chartSize / 2 + padding;
  const rings = [25, 50, 75, 100];
  const total = scores.length;

  function toViewBox(point) {
    return { x: point.x + padding, y: point.y + padding };
  }

  const rawPoints = scores.map((score, index) => polarPoint(index, total, score.score ?? 50, chartSize));
  const points = rawPoints.map(toViewBox);
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  const scoreSignature = scores.map((score) => score.score ?? 50).join("-");

  return (
    <svg className="radar-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel}>
      {rings.map((ring) => {
        const ringPoints = scores
          .map((_, index) => toViewBox(polarPoint(index, total, ring, chartSize)))
          .map((point) => `${point.x},${point.y}`)
          .join(" ");
        return <polygon key={ring} points={ringPoints} className="radar-ring" />;
      })}
      {scores.map((score, index) => {
        const end = toViewBox(polarPoint(index, total, 100, chartSize));
        const label = toViewBox(polarPoint(index, total, 108, chartSize));
        return (
          <g key={score.key}>
            <line x1={center} y1={center} x2={end.x} y2={end.y} className="radar-axis" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className="radar-label">
              {score.short}
            </text>
          </g>
        );
      })}
      <g className="radar-data" key={scoreSignature}>
        <polygon points={polygon} className="radar-area" />
        <polyline points={`${polygon} ${points[0].x},${points[0].y}`} className="radar-line" pathLength="1" />
        {points.map((point, index) => (
          <circle key={scores[index].key} cx={point.x} cy={point.y} r="4.5" className="radar-point" />
        ))}
      </g>
    </svg>
  );
}
