import type { CSSProperties } from "react";

// 심각도 색 — 빨강→주황 한 계열(semantic heat)로, 심각할수록 진하게.
// dataviz 검증 스크립트(--ordinal)로 밝기 순서·단계 간격·대비 확인한 값이라
// 바꿀 때는 다시 검증할 것. Negligible/Unknown은 의미 없는 회색 "기타"로 묶음.
export const severitySeries = [
  { key: "Critical", label: "Critical", color: "#9b1c1c" },
  { key: "High", label: "High", color: "#d63a2a" },
  { key: "Medium", label: "Medium", color: "#ee6f30" },
  { key: "Low", label: "Low", color: "#f0983a" },
  { key: "Other", label: "기타", color: "#cbd5e1" },
] as const;

export type SeverityKey = (typeof severitySeries)[number]["key"];

export const chartInk = {
  primary: "#0f172a",
  secondary: "#475569",
  muted: "#94a3b8",
  track: "#eef2f7", // 막대 뒤 빈 트랙
  safe: "#1f4e8c", // 안전 구성요소 (ZCS 파란색)
  border: "#e2e8f0",
};

export const scanChartStyles: Record<string, CSSProperties> = {
  // ── KPI 타일 ──
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  kpi: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#ffffff",
    border: `1px solid ${chartInk.border}`,
    borderRadius: 10,
    padding: "16px 20px",
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: chartInk.secondary,
  },
  kpiValue: {
    marginTop: 2,
    fontSize: 26,
    fontWeight: 900,
    color: chartInk.primary,
    lineHeight: 1.2,
  },
  kpiUnit: {
    marginLeft: 3,
    fontSize: 14,
    fontWeight: 700,
    color: chartInk.secondary,
  },

  // ── 차트 패널 ──
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },
  chartPanel: {
    background: "#ffffff",
    border: `1px solid ${chartInk.border}`,
    borderRadius: 10,
    padding: "20px 24px 24px",
  },
  chartHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  chartTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    color: chartInk.primary,
  },
  emptyChart: {
    padding: "48px 0",
    textAlign: "center",
    fontSize: 14,
    color: chartInk.secondary,
  },

  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 12px",
    fontSize: 12,
    color: chartInk.secondary,
  },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },

  // 패키지 TOP 5 — 한 줄에 순위 | 이름 | 막대 | 건수
  pkgList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  pkgRow: {
    display: "grid",
    gridTemplateColumns: "22px minmax(110px, 0.9fr) minmax(0, 1.4fr) 40px",
    alignItems: "center",
    gap: 12,
    padding: "9px 0",
    borderBottom: "1px solid #f1f5f9",
    transition: "opacity 0.15s",
  },
  pkgRank: {
    fontSize: 12,
    fontWeight: 800,
    color: chartInk.muted,
    textAlign: "center",
  },
  pkgName: {
    fontSize: 13,
    fontWeight: 800,
    color: chartInk.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pkgVersion: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 600,
    color: chartInk.muted,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
  pkgTotal: {
    fontSize: 13,
    fontWeight: 800,
    color: chartInk.primary,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },

  // ── 구성요소 위험 비율 (RiskOverview 오른쪽) ──
  ratioHead: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginTop: 12,
  },
  ratioValue: {
    fontSize: 40,
    fontWeight: 900,
    lineHeight: 1,
    color: chartInk.primary,
  },
  ratioCaption: {
    fontSize: 13,
    color: chartInk.secondary,
  },
  meter: {
    display: "flex",
    gap: 2,
    height: 12,
    margin: "14px 0 6px",
  },
};
