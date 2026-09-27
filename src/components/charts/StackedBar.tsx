import { useState } from "react";
import type { CSSProperties } from "react";

export type BarSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type StackedBarProps = {
  segments: BarSegment[];
  // 막대 전체 길이의 기준값 (여러 줄을 같은 눈금으로 비교할 때 최댓값 전달)
  // 생략하면 합계 = 100% (비율 막대)
  scaleMax?: number;
  unit?: string;
  height?: number;
};

const styles: Record<string, CSSProperties> = {
  bar: {
    display: "flex",
    gap: 2, // 조각 사이 2px 틈
    width: "100%",
  },
  segment: {
    position: "relative",
    minWidth: 4,
    transition: "opacity 0.15s",
  },
  tooltip: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
    padding: "5px 8px",
    borderRadius: 6,
    background: "#0f172a",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.2)",
  },
};

export function StackedBar({ segments, scaleMax, unit = "", height = 10 }: StackedBarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = segments.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);
  const max = Math.max(scaleMax ?? total, total, 1);
  const last = visible.length - 1;

  return (
    <div style={{ ...styles.bar, height }}>
      {visible.map((s, i) => (
        <div
          key={s.key}
          style={{
            ...styles.segment,
            flexGrow: s.value,
            flexBasis: 0,
            background: s.color,
            opacity: hovered && hovered !== s.key ? 0.35 : 1,
            // 막대 양 끝만 둥글게
            borderRadius: `${i === 0 ? 4 : 0}px ${i === last ? 4 : 0}px ${i === last ? 4 : 0}px ${i === 0 ? 4 : 0}px`,
          }}
          onMouseEnter={() => setHovered(s.key)}
          onMouseLeave={() => setHovered(null)}
        >
          {hovered === s.key && (
            <span style={styles.tooltip}>
              {s.label} {s.value.toLocaleString()}
              {unit}
            </span>
          )}
        </div>
      ))}
      {/* 기준값보다 짧은 만큼은 빈 공간 */}
      {total > 0 && total < max && <div style={{ flexGrow: max - total, flexBasis: 0 }} />}
      {total === 0 && <div style={{ flexGrow: 1, background: "#eef2f7", borderRadius: 4 }} />}
    </div>
  );
}
