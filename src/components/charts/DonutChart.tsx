import { useState } from "react";
import type { CSSProperties } from "react";

export type DonutDatum = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  data: DonutDatum[];
  centerLabel: string; // 가운데 작은 글씨 (예: "전체 취약점")
  unit?: string; // 값 뒤 단위 (예: "건")
  size?: number;
  thickness?: number;
};

const GAP = 2; // 조각 사이 틈(px) — 테두리 대신 배경색 틈으로 구분

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 28,
    flexWrap: "wrap",
  },
  svgBox: {
    position: "relative",
    flexShrink: 0,
  },
  center: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    textAlign: "center",
  },
  centerValue: {
    fontSize: 28,
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.1,
  },
  centerUnit: {
    marginLeft: 2,
    fontSize: 14,
    fontWeight: 700,
    color: "#475569",
  },
  centerLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
  },
  legend: {
    flex: 1,
    minWidth: 180,
    maxWidth: 320, // 넓은 칸에서 이름과 건수 사이가 너무 벌어지지 않게
    display: "flex",
    flexDirection: "column",
    gap: 4,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  legendRow: {
    display: "grid",
    gridTemplateColumns: "12px minmax(0, 1fr) auto 44px",
    alignItems: "center",
    gap: 10,
    padding: "7px 8px",
    borderRadius: 6,
    fontSize: 13,
    transition: "opacity 0.15s, background 0.15s",
    cursor: "default",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    fontWeight: 700,
    color: "#334155",
  },
  legendValue: {
    fontWeight: 800,
    color: "#0f172a",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  legendShare: {
    color: "#94a3b8",
    fontWeight: 600,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
};

export function DonutChart({
  data,
  centerLabel,
  unit = "",
  size = 168,
  thickness = 22,
}: DonutChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const visible = data.filter((d) => d.value > 0);
  // 조각이 하나뿐이면 틈 없이 꽉 찬 링
  const gap = visible.length > 1 ? GAP : 0;

  const active = hovered ? data.find((d) => d.key === hovered) : null;
  const share = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

  let offset = 0;
  const arcs = visible.map((d) => {
    const length = (d.value / total) * circumference;
    const arc = {
      ...d,
      dash: Math.max(length - gap, 1),
      offset,
    };
    offset += length;
    return arc;
  });

  const fade = (key: string) => (hovered && hovered !== key ? 0.3 : 1);

  return (
    <div style={styles.wrap}>
      <div style={{ ...styles.svgBox, width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${centerLabel} ${total}${unit}: ${visible
            .map((d) => `${d.label} ${d.value}${unit}`)
            .join(", ")}`}
        >
          {/* 12시 방향부터 시계 방향으로 */}
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#eef2f7"
              strokeWidth={thickness}
            />
            {arcs.map((arc) => (
              <circle
                key={arc.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={hovered === arc.key ? thickness + 4 : thickness}
                strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                strokeDashoffset={-arc.offset}
                style={{ transition: "opacity 0.15s, stroke-width 0.15s", opacity: fade(arc.key), cursor: "pointer" }}
                onMouseEnter={() => setHovered(arc.key)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </g>
        </svg>

        {/* 가운데: 평소엔 합계, 마우스 올리면 해당 조각 값 */}
        <div style={styles.center}>
          <div style={styles.centerValue}>
            {(active ? active.value : total).toLocaleString()}
            <span style={styles.centerUnit}>{unit}</span>
          </div>
          <div style={styles.centerLabel}>
            {active ? `${active.label} · ${share(active.value)}%` : centerLabel}
          </div>
        </div>
      </div>

      <ul style={styles.legend}>
        {data.map((d) => (
          <li
            key={d.key}
            style={{
              ...styles.legendRow,
              opacity: fade(d.key),
              background: hovered === d.key ? "#f8fafc" : "transparent",
            }}
            onMouseEnter={() => setHovered(d.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ ...styles.dot, background: d.color }} />
            <span style={styles.legendLabel}>{d.label}</span>
            <span style={styles.legendValue}>
              {d.value.toLocaleString()}
              {unit}
            </span>
            <span style={styles.legendShare}>{share(d.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
