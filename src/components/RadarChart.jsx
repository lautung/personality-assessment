import { traitOrder, traits } from "../data/assessment.js";

function polarPoint(index, value, size) {
  const center = size / 2;
  const radius = (size * 0.38 * value) / 100;
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / traitOrder.length;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

export default function RadarChart({ scores, compact = false }) {
  const size = compact ? 190 : 250;
  const center = size / 2;
  const rings = [25, 50, 75, 100];
  const points = scores.map((score, index) => polarPoint(index, score.score ?? 50, size));
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  const scoreSignature = scores.map((score) => score.score ?? 50).join("-");

  return (
    <svg className="radar-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="五维人格雷达图">
      {rings.map((ring) => {
        const ringPoints = traitOrder
          .map((_, index) => polarPoint(index, ring, size))
          .map((point) => `${point.x},${point.y}`)
          .join(" ");
        return <polygon key={ring} points={ringPoints} className="radar-ring" />;
      })}
      {traitOrder.map((traitKey, index) => {
        const end = polarPoint(index, 100, size);
        const label = polarPoint(index, 116, size);
        return (
          <g key={traitKey}>
            <line x1={center} y1={center} x2={end.x} y2={end.y} className="radar-axis" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className="radar-label">
              {traits[traitKey].short}
            </text>
          </g>
        );
      })}
      <g className="radar-data" key={scoreSignature}>
        <polygon points={polygon} className="radar-area" />
        <polyline points={`${polygon} ${points[0].x},${points[0].y}`} className="radar-line" pathLength="1" />
        {points.map((point, index) => (
          <circle key={traitOrder[index]} cx={point.x} cy={point.y} r="4.5" className="radar-point" />
        ))}
      </g>
    </svg>
  );
}
