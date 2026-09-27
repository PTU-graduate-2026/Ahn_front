import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardSummary,
  FileHistoryItem,
  getDashboardSummary,
} from "../services/_private/SbomApi";
import { logout } from "../utils/currentUser";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    color: "#0f172a",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",
  },
  topbar: {
    height: 58,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    background: "#fff",
    borderBottom: "1px solid #dfe7f2",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    fontSize: 26,
    lineHeight: 1,
    fontWeight: 950,
    color: "#1f4e8c",
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 900,
    color: "#1f4e8c",
  },
  brandSub: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },
  navItem: {
    border: 0,
    background: "transparent",
    color: "#334155",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  content: {
    padding: "18px 32px 40px",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14,
  },
  pageTitle: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 950,
    letterSpacing: 0,
  },
  pageSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },
  actionRow: {
    display: "flex",
    gap: 8,
  },
  header: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 12,
  },
  button: {
    height: 36,
    padding: "0 14px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#1e293b",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
  },
  primaryButton: {
    height: 36,
    padding: "0 14px",
    borderRadius: 8,
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
  },
  riskPanel: {
    display: "grid",
    gridTemplateColumns: "150px 1fr 180px",
    alignItems: "center",
    gap: 18,
    padding: "14px 18px",
    border: "1px solid #fecaca",
    borderRadius: 8,
    background: "#fff7f7",
    marginBottom: 12,
  },
  riskTitle: {
    margin: 0,
    fontSize: 12,
    fontWeight: 950,
    color: "#64748b",
  },
  riskLevel: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: 950,
  },
  riskCopy: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  riskTrack: {
    height: 8,
    marginTop: 0,
    overflow: "hidden",
    borderRadius: 999,
    background: "#e2e8f0",
  },
  riskBar: {
    height: "100%",
    borderRadius: 999,
    background: "#ef4444",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    padding: "14px 16px",
    border: "1px solid #dbe3ef",
    borderRadius: 8,
    background: "#fff",
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 900,
  },
  statValue: {
    marginTop: 0,
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 950,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "360px minmax(0, 1fr)",
    gap: 12,
    alignItems: "start",
  },
  stack: {
    display: "grid",
    gap: 12,
  },
  card: {
    overflow: "hidden",
    border: "1px solid #dbe3ef",
    borderRadius: 8,
    background: "#fff",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 16px",
    borderBottom: "1px solid #e2e8f0",
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 950,
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eef4ff",
    color: "#1e3a8a",
    fontSize: 12,
    fontWeight: 900,
  },
  body: {
    padding: 16,
  },
  severityRow: {
    display: "grid",
    gridTemplateColumns: "82px 1fr 48px",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  rowName: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 900,
  },
  track: {
    height: 10,
    overflow: "hidden",
    borderRadius: 999,
    background: "#e2e8f0",
  },
  bar: {
    height: "100%",
    borderRadius: 999,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  th: {
    padding: "12px 14px",
    background: "#f8fafc",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 12,
    fontWeight: 950,
    textAlign: "left",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #eef2f7",
    fontSize: 13,
    fontWeight: 800,
    verticalAlign: "middle",
    wordBreak: "break-word",
  },
  fileName: {
    fontWeight: 950,
  },
  muted: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
  },
  chipRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  chip: {
    padding: "4px 7px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 11,
    fontWeight: 950,
  },
  dangerChip: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  warningChip: {
    background: "#ffedd5",
    color: "#9a3412",
  },
  blockChip: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  reviewChip: {
    background: "#fef3c7",
    color: "#92400e",
  },
  passChip: {
    background: "#dcfce7",
    color: "#166534",
  },
  empty: {
    padding: 34,
    color: "#64748b",
    fontSize: 15,
    fontWeight: 700,
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
      color: "#dc2626",
      copy: "Critical 취약점이 포함되어 있습니다. 우선 조치 항목과 위험 파일을 먼저 확인하는 것이 좋습니다.",
    };
  }

  if (summary.highCount > 0) {
    return {
      label: "주의 필요",
      color: "#ea580c",
      copy: "High 취약점이 발견되었습니다. 배포 전 패키지 버전과 수정 ZIP 적용 여부를 확인하세요.",
    };
  }

  return {
    label: "양호",
    color: "#15803d",
    copy: "현재 저장된 분석 기준으로 심각한 취약점이 발견되지 않았습니다.",
  };
};

const getPolicyChipStyle = (decision?: string) => {
  if (decision === "BLOCK") return styles.blockChip;
  if (decision === "REVIEW") return styles.reviewChip;
  if (decision === "PASS") return styles.passChip;
  return styles.chip;
};

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

  const severityItems = useMemo(
    () => [
      { name: "Critical", value: summary.criticalCount, color: "#ef4444" },
      { name: "High", value: summary.highCount, color: "#f97316" },
      { name: "Medium", value: summary.mediumCount, color: "#eab308" },
      { name: "Low", value: summary.lowCount, color: "#22c55e" },
    ],
    [summary],
  );

  const maxSeverity = Math.max(...severityItems.map((item) => item.value), 1);
  const risk = getRiskLevel(summary);
  const criticalRatio =
    summary.totalFindings > 0
      ? Math.min((summary.criticalCount / summary.totalFindings) * 100, 100)
      : 0;
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main style={styles.page}>
      <nav style={styles.topbar}>
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="홈으로 이동"
          style={{ ...styles.brand, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <div style={styles.brandMark}>ZCS</div>
          <div style={styles.brandText}>
            <div style={styles.brandName}>Zero Check SBOM</div>
            <div style={styles.brandSub}>Security Service</div>
          </div>
        </button>
        <div style={styles.nav}>
          <button style={styles.navItem} onClick={() => navigate("/upload")}>
            파일 입력
          </button>
          <button style={styles.navItem} onClick={() => navigate("/history")}>
            저장소
          </button>
          <button style={styles.navItem} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        <section style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>SBOM 보안 현황</h1>
            <p style={styles.pageSubtitle}>
              분석 이력, 구성요소, 취약점 분포와 우선 확인 파일을 요약합니다.
            </p>
          </div>
          <div style={styles.actionRow}>
            <button style={styles.button} onClick={() => navigate("/history")}>
              분석 히스토리
            </button>
            <button style={styles.primaryButton} onClick={() => navigate("/upload")}>
              새 파일 분석
            </button>
          </div>
        </section>

        <section style={styles.header}>
          <StatCard label="분석 파일" value={summary.totalFiles} />
          <StatCard label="분석 완료" value={summary.doneCount} />
          <StatCard label="구성요소" value={summary.totalComponents} />
          <StatCard label="전체 취약점" value={summary.totalFindings} />
        </section>

        <aside style={styles.riskPanel}>
          <div>
            <h2 style={styles.riskTitle}>현재 위험 상태</h2>
            <div style={{ ...styles.riskLevel, color: risk.color }}>{risk.label}</div>
          </div>
          <p style={styles.riskCopy}>{risk.copy}</p>
          <div style={styles.riskTrack}>
            <div
              style={{
                ...styles.riskBar,
                width: `${Math.max(criticalRatio, summary.criticalCount > 0 ? 8 : 0)}%`,
                background: risk.color,
              }}
            />
          </div>
        </aside>

        <section style={styles.grid}>
          <div style={styles.stack}>
            <DistributionCard
              title="취약점 분포"
              badge={`총 ${summary.totalFindings}건`}
              rows={severityItems}
              maxValue={maxSeverity}
            />
            <DistributionCard
              title="분석 처리 상태"
              badge={`완료 ${summary.doneCount}건`}
              rows={[
                { name: "DONE", value: summary.doneCount, color: "#2563eb" },
                { name: "ANALYZING", value: summary.analyzingCount, color: "#14b8a6" },
                { name: "FAILED", value: summary.failedCount, color: "#ef4444" },
              ]}
              maxValue={Math.max(summary.totalFiles, 1)}
            />
          </div>

          <FileTable
            title="최근 분석"
            badge={`최근 ${summary.latestFiles.length}건`}
            files={summary.latestFiles}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onOpen={(fileSeq) => navigate(`/scan-result/${fileSeq}`)}
          />
        </section>

        <section style={{ marginTop: 18 }}>
          <FileTable
            title="위험 파일 TOP 5"
            badge="Risk Score"
            files={summary.riskyFiles}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onOpen={(fileSeq) => navigate(`/scan-result/${fileSeq}`)}
          />
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

type DistributionRow = {
  name: string;
  value: number;
  color: string;
};

function DistributionCard({
  title,
  badge,
  rows,
  maxValue,
}: {
  title: string;
  badge: string;
  rows: DistributionRow[];
  maxValue: number;
}) {
  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>{title}</h2>
        <span style={styles.badge}>{badge}</span>
      </div>
      <div style={styles.body}>
        {rows.map((item) => (
          <div key={item.name} style={styles.severityRow}>
            <div style={styles.rowName}>{item.name}</div>
            <div style={styles.track}>
              <div
                style={{
                  ...styles.bar,
                  width: `${Math.max((item.value / Math.max(maxValue, 1)) * 100, item.value > 0 ? 4 : 0)}%`,
                  background: item.color,
                }}
              />
            </div>
            <div style={styles.rowName}>{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

type FileTableProps = {
  title: string;
  badge: string;
  files: FileHistoryItem[];
  isLoading: boolean;
  errorMessage: string;
  onOpen: (fileSeq: number) => void;
};

function FileTable({
  title,
  badge,
  files,
  isLoading,
  errorMessage,
  onOpen,
}: FileTableProps) {
  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>{title}</h2>
        <span style={styles.badge}>{badge}</span>
      </div>
      {isLoading && <div style={styles.empty}>대시보드를 불러오는 중입니다.</div>}
      {!isLoading && errorMessage && <div style={styles.empty}>{errorMessage}</div>}
      {!isLoading && !errorMessage && files.length === 0 && (
        <div style={styles.empty}>표시할 분석 파일이 없습니다.</div>
      )}
      {!isLoading && !errorMessage && files.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "43%" }}>파일</th>
              <th style={{ ...styles.th, width: "30%" }}>위험도 / 정책</th>
              <th style={{ ...styles.th, width: "14%" }}>업로드</th>
              <th style={{ ...styles.th, width: "13%" }}>결과</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={`${title}-${file.fileSeq}`}>
                <td style={styles.td}>
                  <div style={styles.fileName}>{file.fileName}</div>
                  <div style={styles.muted}>
                    파일 {file.fileSeq} · 구성요소 {file.componentCount ?? 0}개
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.chipRow}>
                    <span style={{ ...styles.chip, ...styles.dangerChip }}>
                      C {file.criticalCount ?? 0}
                    </span>
                    <span style={{ ...styles.chip, ...styles.warningChip }}>
                      H {file.highCount ?? 0}
                    </span>
                    <span style={styles.chip}>T {file.totalFindings ?? 0}</span>
                    {file.policyDecisionLabel && (
                      <span
                        style={{
                          ...styles.chip,
                          ...getPolicyChipStyle(file.policyDecision),
                        }}
                      >
                        {file.policyDecisionLabel}
                      </span>
                    )}
                  </div>
                </td>
                <td style={styles.td}>{formatDate(file.uploadDate)}</td>
                <td style={styles.td}>
                  <button style={styles.button} onClick={() => onOpen(file.fileSeq)}>
                    보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
