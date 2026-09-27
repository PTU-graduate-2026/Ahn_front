import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  ChevronRight,
  CircleCheck,
  FileStack,
  History,
  Plus,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  DashboardSummary,
  FileHistoryItem,
  getDashboardSummary,
} from "../services/_private/SbomApi";
import Topbar from "./IntroduceScreen/Topbar";
import { DonutChart } from "../components/charts/DonutChart";
import { StackedBar } from "../components/charts/StackedBar";
import { severitySeries } from "../styles/scanCharts";

const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    color: "#0f172a",
    fontFamily: font,
  },
  content: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "32px 32px 56px",
    boxSizing: "border-box",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  pageTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: "-0.3px",
  },
  pageSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  actionRow: {
    display: "flex",
    gap: 8,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 40,
    padding: "0 16px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#1e293b",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 40,
    padding: "0 16px",
    borderRadius: 8,
    border: "1px solid #173357",
    background: "#173357", // ZCS 어두운 파란색
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
  },

  // KPI 타일
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  kpi: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "18px 20px",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#fff",
  },
  kpiIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kpiLabel: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
  },
  kpiValue: {
    marginTop: 2,
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 900,
  },
  kpiSub: {
    marginTop: 2,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
  },

  // 위험 상태 배너
  riskBanner: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 20px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    borderLeftWidth: 4,
    background: "#fff",
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 15,
    fontWeight: 900,
  },
  riskCopy: {
    margin: "2px 0 0",
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.5,
  },

  // 차트/카드 배치
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  stack: {
    display: "grid",
    gap: 16,
    alignContent: "start",
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#fff",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "18px 22px 0",
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
  },
  cardMeta: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
  },
  cardBody: {
    padding: "18px 22px 22px",
  },

  // 분석 처리 상태
  statusLegend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 18px",
    marginTop: 14,
    fontSize: 13,
    color: "#475569",
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
  legendValue: {
    fontWeight: 800,
    color: "#0f172a",
  },

  // 위험 파일 TOP 5 차트
  riskRow: {
    display: "grid",
    gridTemplateColumns: "22px minmax(0, 1fr) minmax(0, 1.2fr) 44px 16px",
    alignItems: "center",
    gap: 12,
    padding: "11px 8px",
    margin: "0 -8px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  rank: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 800,
    textAlign: "center",
  },
  fileName: {
    fontSize: 14,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileMeta: {
    marginTop: 2,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
  },
  total: {
    fontSize: 13,
    fontWeight: 800,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },

  // 최근 분석 테이블
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  th: {
    padding: "12px 22px",
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "left",
  },
  td: {
    padding: "14px 22px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    verticalAlign: "middle",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
  },
  blockChip: { background: "#fee2e2", color: "#991b1b" },
  reviewChip: { background: "#fef3c7", color: "#92400e" },
  passChip: { background: "#dcfce7", color: "#166534" },
  empty: {
    padding: "40px 22px",
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
};

const emptySummary: DashboardSummary = {
  totalFiles: 0,
  doneCount: 0,
  failedCount: 0,
  analyzingCount: 0,
  totalComponents: 0,
  totalFindings: 0,
  criticalCount: 0,
  highCount: 0,
  mediumCount: 0,
  lowCount: 0,
  latestFiles: [],
  riskyFiles: [],
};

// 분석 처리 상태 색 — dataviz 검증 스크립트로 색각 이상 구분 확인 (완료↔실패는
// 막대에서 맞닿지 않게 순서 배치). 상태를 뜻하므로 라벨·건수와 항상 같이 표시
const statusColors = {
  done: "#16a34a",
  analyzing: "#3987e5",
  failed: "#d03b3b",
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRiskLevel = (summary: DashboardSummary) => {
  if (summary.criticalCount > 0) {
    return {
      label: "긴급 점검 필요",
      color: "#b91c1c",
      icon: <ShieldAlert size={22} />,
      copy: `Critical 취약점 ${summary.criticalCount}건이 포함되어 있습니다. 아래 위험 파일부터 먼저 확인하세요.`,
    };
  }

  if (summary.highCount > 0) {
    return {
      label: "주의 필요",
      color: "#c2410c",
      icon: <ShieldAlert size={22} />,
      copy: `High 취약점 ${summary.highCount}건이 발견되었습니다. 배포 전 패키지 버전과 수정 ZIP 적용 여부를 확인하세요.`,
    };
  }

  return {
    label: "양호",
    color: "#15803d",
    icon: <ShieldCheck size={22} />,
    copy: "현재 저장된 분석 기준으로 심각한 취약점이 발견되지 않았습니다.",
  };
};

const getPolicyChipStyle = (decision?: string) => {
  if (decision === "BLOCK") return styles.blockChip;
  if (decision === "REVIEW") return styles.reviewChip;
  if (decision === "PASS") return styles.passChip;
  return {};
};

// 파일 하나의 등급별 건수 → 누적 막대 조각
const fileSegments = (file: FileHistoryItem) => [
  { key: "Critical", label: "Critical", value: file.criticalCount ?? 0, color: severitySeries[0].color },
  { key: "High", label: "High", value: file.highCount ?? 0, color: severitySeries[1].color },
  { key: "Medium", label: "Medium", value: file.mediumCount ?? 0, color: severitySeries[2].color },
  { key: "Low", label: "Low", value: file.lowCount ?? 0, color: severitySeries[3].color },
];

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getDashboardSummary();
        if (mounted) setSummary(response?.data ?? emptySummary);
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            "대시보드 API를 불러오지 못했습니다. 백엔드에 GET /api/dashboard/summary가 있는지 확인해주세요.",
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const severityData = useMemo(
    () => [
      { key: "Critical", label: "Critical", value: summary.criticalCount, color: severitySeries[0].color },
      { key: "High", label: "High", value: summary.highCount, color: severitySeries[1].color },
      { key: "Medium", label: "Medium", value: summary.mediumCount, color: severitySeries[2].color },
      { key: "Low", label: "Low", value: summary.lowCount, color: severitySeries[3].color },
    ],
    [summary],
  );

  const statusData = [
    { key: "done", label: "완료", value: summary.doneCount, color: statusColors.done },
    { key: "analyzing", label: "분석 중", value: summary.analyzingCount, color: statusColors.analyzing },
    { key: "failed", label: "실패", value: summary.failedCount, color: statusColors.failed },
  ];

  const risk = getRiskLevel(summary);
  const maxRiskyTotal = Math.max(...summary.riskyFiles.map((f) => f.totalFindings ?? 0), 1);
  const openResult = (fileSeq: number) => navigate(`/scan-result/${fileSeq}`);

  const kpis = [
    {
      label: "분석 파일",
      value: summary.totalFiles,
      unit: "개",
      sub: `분석 중 ${summary.analyzingCount} · 실패 ${summary.failedCount}`,
      icon: <FileStack size={20} />,
      color: "#1f4e8c",
      bg: "rgba(31, 78, 140, 0.08)",
    },
    {
      label: "분석 완료",
      value: summary.doneCount,
      unit: "개",
      sub:
        summary.totalFiles > 0
          ? `완료율 ${Math.round((summary.doneCount / summary.totalFiles) * 100)}%`
          : "완료율 -",
      icon: <CircleCheck size={20} />,
      color: "#15803d",
      bg: "rgba(22, 163, 74, 0.08)",
    },
    {
      label: "구성요소",
      value: summary.totalComponents,
      unit: "개",
      sub: "전체 분석 파일 합계",
      icon: <Boxes size={20} />,
      color: "#1f4e8c",
      bg: "rgba(31, 78, 140, 0.08)",
    },
    {
      label: "전체 취약점",
      value: summary.totalFindings,
      unit: "건",
      sub: `Critical ${summary.criticalCount} · High ${summary.highCount}`,
      icon: <ShieldAlert size={20} />,
      color: "#9b1c1c",
      bg: "rgba(155, 28, 28, 0.08)",
    },
  ];

  const renderState = (files: FileHistoryItem[]) => {
    if (isLoading) return <div style={styles.empty}>대시보드를 불러오는 중입니다.</div>;
    if (errorMessage) return <div style={styles.empty}>{errorMessage}</div>;
    if (files.length === 0) return <div style={styles.empty}>표시할 분석 파일이 없습니다.</div>;
    return null;
  };

  return (
    <main style={styles.page}>
      <Topbar />

      <div style={styles.content}>
        <section style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>SBOM 보안 현황</h1>
            <p style={styles.pageSubtitle}>
              분석 이력, 구성요소, 취약점 분포와 우선 확인할 파일을 한눈에 봅니다.
            </p>
          </div>
          <div style={styles.actionRow}>
            <button type="button" style={styles.button} onClick={() => navigate("/history")}>
              <History size={16} />
              분석 히스토리
            </button>
            <button type="button" style={styles.primaryButton} onClick={() => navigate("/upload")}>
              <Plus size={16} />
              새 파일 분석
            </button>
          </div>
        </section>

        <section style={styles.kpiRow}>
          {kpis.map((kpi) => (
            <div key={kpi.label} style={styles.kpi}>
              <div style={{ ...styles.kpiIcon, color: kpi.color, background: kpi.bg }}>{kpi.icon}</div>
              <div style={{ minWidth: 0 }}>
                <div style={styles.kpiLabel}>{kpi.label}</div>
                <div style={styles.kpiValue}>
                  {kpi.value.toLocaleString()}
                  <span style={{ ...styles.kpiSub, marginLeft: 3, fontSize: 14 }}>{kpi.unit}</span>
                </div>
                <div style={styles.kpiSub}>{kpi.sub}</div>
              </div>
            </div>
          ))}
        </section>

        {!isLoading && !errorMessage && (
          <aside style={{ ...styles.riskBanner, borderLeftColor: risk.color }}>
            <span style={{ color: risk.color, display: "flex" }}>{risk.icon}</span>
            <div>
              <div style={{ ...styles.riskLabel, color: risk.color }}>{risk.label}</div>
              <p style={styles.riskCopy}>{risk.copy}</p>
            </div>
          </aside>
        )}

        <section style={styles.grid}>
          <div style={styles.stack}>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>취약점 분포</h2>
                <span style={styles.cardMeta}>전체 파일 기준</span>
              </div>
              <div style={styles.cardBody}>
                <DonutChart data={severityData} centerLabel="전체 취약점" unit="건" size={156} />
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>분석 처리 상태</h2>
                <span style={styles.cardMeta}>총 {summary.totalFiles}개 파일</span>
              </div>
              <div style={styles.cardBody}>
                <StackedBar segments={statusData} unit="개" height={12} />
                <div style={styles.statusLegend}>
                  {statusData.map((s) => (
                    <span key={s.key} style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: s.color }} />
                      {s.label} <span style={styles.legendValue}>{s.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>위험 파일 TOP 5</h2>
              <div style={styles.statusLegend}>
                {severityData.map((s) => (
                  <span key={s.key} style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={styles.cardBody}>
              {renderState(summary.riskyFiles) ??
                summary.riskyFiles.slice(0, 5).map((file, index) => (
                  <div
                    key={`risky-${file.fileSeq}`}
                    style={styles.riskRow}
                    role="button"
                    tabIndex={0}
                    onClick={() => openResult(file.fileSeq)}
                    onKeyDown={(e) => e.key === "Enter" && openResult(file.fileSeq)}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={styles.rank}>{index + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.fileName} title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div style={styles.fileMeta}>구성요소 {file.componentCount ?? 0}개</div>
                    </div>
                    <StackedBar segments={fileSegments(file)} scaleMax={maxRiskyTotal} unit="건" />
                    <span style={styles.total}>{file.totalFindings ?? 0}건</span>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>
                ))}
            </div>
          </section>
        </section>

        <section style={styles.card}>
          <div style={{ ...styles.cardHeader, paddingBottom: 14 }}>
            <h2 style={styles.cardTitle}>최근 분석</h2>
            <span style={styles.cardMeta}>최근 {summary.latestFiles.length}건</span>
          </div>
          {renderState(summary.latestFiles) ?? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: "34%" }}>파일</th>
                  <th style={{ ...styles.th, width: "30%" }}>취약점</th>
                  <th style={{ ...styles.th, width: "14%" }}>정책 판정</th>
                  <th style={{ ...styles.th, width: "15%" }}>업로드</th>
                  <th style={{ ...styles.th, width: "7%" }} aria-label="결과 보기" />
                </tr>
              </thead>
              <tbody>
                {summary.latestFiles.map((file) => (
                  <tr
                    key={`latest-${file.fileSeq}`}
                    style={{ cursor: "pointer", transition: "background 0.15s" }}
                    onClick={() => openResult(file.fileSeq)}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={styles.td}>
                      <div style={styles.fileName} title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div style={styles.fileMeta}>
                        파일 {file.fileSeq} · 구성요소 {file.componentCount ?? 0}개
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 44px", alignItems: "center", gap: 10 }}>
                        <StackedBar segments={fileSegments(file)} unit="건" height={8} />
                        <span style={styles.total}>{file.totalFindings ?? 0}건</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {file.policyDecisionLabel ? (
                        <span style={{ ...styles.chip, ...getPolicyChipStyle(file.policyDecision) }}>
                          {file.policyDecisionLabel}
                        </span>
                      ) : (
                        <span style={styles.fileMeta}>-</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, color: "#475569" }}>{formatDate(file.uploadDate)}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button
                        type="button"
                        aria-label={`${file.fileName} 결과 보기`}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "inline-flex" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openResult(file.fileSeq);
                        }}
                      >
                        <ChevronRight size={18} color="#94a3b8" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
