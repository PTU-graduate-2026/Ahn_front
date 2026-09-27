import { useMemo, useState } from "react";
import { Boxes, PackageX, ShieldAlert } from "lucide-react";
import type { ScanResult } from "../../services/_private/SbomApi";
import { DonutChart } from "../charts/DonutChart";
import { StackedBar } from "../charts/StackedBar";
import { chartInk, scanChartStyles as styles, severitySeries } from "../../styles/scanCharts";
import type { SeverityKey } from "../../styles/scanCharts";

type ScanSummaryCardsProps = {
  results: ScanResult[];
  componentCount: number;
  vulnerableComponentCount: number;
  findingCount: number;
};

type SeverityCounts = Record<SeverityKey, number>;

const emptyCounts = (): SeverityCounts => ({
  Critical: 0,
  High: 0,
  Medium: 0,
  Low: 0,
  Other: 0,
});

// "CRITICAL", "critical" 등 대소문자가 섞여 와도 같은 등급으로 묶음
const toSeverityKey = (severity?: string): SeverityKey => {
  const s = (severity ?? "").toLowerCase();
  if (s === "critical") return "Critical";
  if (s === "high") return "High";
  if (s === "medium") return "Medium";
  if (s === "low") return "Low";
  return "Other"; // Negligible, Unknown 등
};

const toSegments = (counts: SeverityCounts) =>
  severitySeries.map((s) => ({ key: s.key, label: s.label, value: counts[s.key], color: s.color }));

export function ScanSummaryCards({
  results,
  componentCount,
  vulnerableComponentCount,
  findingCount,
}: ScanSummaryCardsProps) {
  const [hoveredPkg, setHoveredPkg] = useState<string | null>(null);

  const severityCounts = useMemo(() => {
    const counts = emptyCounts();
    results.forEach((item) => {
      counts[toSeverityKey(item.severity)] += 1;
    });
    return counts;
  }, [results]);

  // 패키지별 취약점 수 (등급별로 나눠서) → 많은 순 TOP 5
  const topPackages = useMemo(() => {
    const map = new Map<string, { name: string; version: string; counts: SeverityCounts; total: number }>();
    results.forEach((item) => {
      const key = `${item.pkgName}@${item.pkgVersion}`;
      const entry = map.get(key) ?? { name: item.pkgName, version: item.pkgVersion, counts: emptyCounts(), total: 0 };
      entry.counts[toSeverityKey(item.severity)] += 1;
      entry.total += 1;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort(
        (a, b) =>
          b.total - a.total ||
          b.counts.Critical - a.counts.Critical ||
          b.counts.High - a.counts.High,
      )
      .slice(0, 5);
  }, [results]);

  // 기타(Negligible/Unknown)는 있을 때만 범례에 표시
  const donutData = toSegments(severityCounts).filter((d) => d.key !== "Other" || d.value > 0);
  const maxPkgTotal = Math.max(...topPackages.map((p) => p.total), 1);

  const kpis = [
    { label: "전체 구성요소", value: componentCount, unit: "개", icon: <Boxes size={20} />, color: chartInk.safe, bg: "rgba(31, 78, 140, 0.08)" },
    { label: "취약 구성요소", value: vulnerableComponentCount, unit: "개", icon: <PackageX size={20} />, color: "#d63a2a", bg: "rgba(214, 58, 42, 0.08)" },
    { label: "발견 취약점", value: findingCount, unit: "건", icon: <ShieldAlert size={20} />, color: "#9b1c1c", bg: "rgba(155, 28, 28, 0.08)" },
  ];

  return (
    <>
      <section style={styles.kpiRow}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={styles.kpi}>
            <div style={{ ...styles.kpiIcon, color: kpi.color, background: kpi.bg }}>{kpi.icon}</div>
            <div>
              <div style={styles.kpiLabel}>{kpi.label}</div>
              <div style={styles.kpiValue}>
                {kpi.value.toLocaleString()}
                <span style={styles.kpiUnit}>{kpi.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section style={styles.chartGrid}>
        <div style={styles.chartPanel}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>심각도 분포</h2>
          </div>
          {results.length === 0 ? (
            <div style={styles.emptyChart}>발견된 취약점이 없습니다.</div>
          ) : (
            <DonutChart data={donutData} centerLabel="전체 취약점" unit="건" />
          )}
        </div>

        <div style={styles.chartPanel}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>취약 패키지 TOP 5</h2>
            <div style={styles.legend}>
              {severitySeries
                .filter((s) => topPackages.some((p) => p.counts[s.key] > 0))
                .map((s) => (
                  <span key={s.key} style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, background: s.color }} />
                    {s.label}
                  </span>
                ))}
            </div>
          </div>
          {topPackages.length === 0 ? (
            <div style={styles.emptyChart}>취약한 패키지가 없습니다.</div>
          ) : (
            <div style={styles.pkgList}>
              {topPackages.map((pkg, index) => (
                <div
                  key={pkg.key}
                  style={{ ...styles.pkgRow, opacity: hoveredPkg && hoveredPkg !== pkg.key ? 0.45 : 1 }}
                  onMouseEnter={() => setHoveredPkg(pkg.key)}
                  onMouseLeave={() => setHoveredPkg(null)}
                >
                  <span style={styles.pkgRank}>{index + 1}</span>
                  <span style={styles.pkgName} title={`${pkg.name}@${pkg.version}`}>
                    {pkg.name}
                    <span style={styles.pkgVersion}>{pkg.version}</span>
                  </span>
                  <StackedBar segments={toSegments(pkg.counts)} scaleMax={maxPkgTotal} unit="건" />
                  <span style={styles.pkgTotal}>{pkg.total}건</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
