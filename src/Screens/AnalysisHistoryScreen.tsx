import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LayoutDashboard, Plus, Search } from "lucide-react";
import {
  FileHistoryItem,
  getFileHistory,
} from "../services/_private/SbomApi";
import Topbar from "./IntroduceScreen/Topbar";
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: "-0.3px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  buttonGroup: {
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

  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#fff",
    overflow: "hidden",
  },

  // 목록 위 필터 줄 (검색 | 정책 판정 탭 | 정렬)
  toolbar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    padding: "16px 22px",
    borderBottom: "1px solid #e2e8f0",
  },
  searchBox: {
    position: "relative",
    flex: "1 1 240px",
    maxWidth: 320,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    height: 38,
    padding: "0 12px 0 36px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    fontFamily: font,
  },
  tabs: {
    display: "flex",
    gap: 4,
    padding: 4,
    borderRadius: 8,
    background: "#f1f5f9",
  },
  tab: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 30,
    padding: "0 12px",
    border: "none",
    borderRadius: 6,
    background: "transparent",
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
  },
  tabActive: {
    background: "#fff",
    color: "#0f172a",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
  },
  tabCount: {
    color: "#94a3b8",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  sortSelect: {
    marginLeft: "auto",
    height: 38,
    padding: "0 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
  },

  // 목록 표
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
  row: {
    cursor: "pointer",
    transition: "background 0.15s",
  },
  td: {
    padding: "14px 22px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    color: "#334155",
    verticalAlign: "middle",
  },
  fileName: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    minWidth: 0,
  },
  fileNameText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  muted: {
    marginTop: 2,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
  },
  findingCell: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 44px",
    alignItems: "center",
    gap: 10,
  },
  total: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  noFinding: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: 700,
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
    whiteSpace: "nowrap",
  },
  blockChip: { background: "#fee2e2", color: "#991b1b" },
  reviewChip: { background: "#fef3c7", color: "#92400e" },
  passChip: { background: "#dcfce7", color: "#166534" },
  // 분석 중/실패 파일 표시 (이름 옆 작은 칩)
  statusChip: {
    flexShrink: 0,
    height: 20,
    padding: "0 8px",
    fontSize: 11,
  },
  analyzingChip: { background: "#dbeafe", color: "#1d4ed8" },
  failedChip: { background: "#fee2e2", color: "#991b1b" },

  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 14px",
    padding: "12px 22px",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: 12,
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
  empty: {
    padding: "48px 22px",
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
};

type PolicyFilter = "ALL" | "BLOCK" | "REVIEW" | "PASS";
type SortKey = "latest" | "findings";

const policyTabs: { key: PolicyFilter; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "BLOCK", label: "배포 차단" },
  { key: "REVIEW", label: "검토 필요" },
  { key: "PASS", label: "배포 가능" },
];

const formatBytes = (size?: number) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPolicyChipStyle = (decision?: string) => {
  if (decision === "BLOCK") return styles.blockChip;
  if (decision === "REVIEW") return styles.reviewChip;
  if (decision === "PASS") return styles.passChip;
  return {};
};

// 분석이 끝나지 않은 파일만 상태 칩 표시
const getStatusChip = (status?: string) => {
  if (status === "ANALYZING") return { label: "분석 중", style: styles.analyzingChip };
  if (status === "FAILED") return { label: "실패", style: styles.failedChip };
  return null;
};

// 파일 하나의 등급별 건수 → 누적 막대 조각
const fileSegments = (item: FileHistoryItem) => [
  { key: "Critical", label: "Critical", value: item.criticalCount ?? 0, color: severitySeries[0].color },
  { key: "High", label: "High", value: item.highCount ?? 0, color: severitySeries[1].color },
  { key: "Medium", label: "Medium", value: item.mediumCount ?? 0, color: severitySeries[2].color },
  { key: "Low", label: "Low", value: item.lowCount ?? 0, color: severitySeries[3].color },
];

export default function AnalysisHistoryScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FileHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [policyFilter, setPolicyFilter] = useState<PolicyFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("latest");

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getFileHistory();
        const history = response?.data?.files ?? response?.data ?? [];
        if (mounted) {
          setItems(Array.isArray(history) ? history : []);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            "분석 히스토리 API를 불러오지 못했습니다. 백엔드에 GET /api/files가 있는지 확인해주세요.",
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadHistory();
    return () => {
      mounted = false;
    };
  }, []);

  // 탭마다 몇 건인지 (검색어는 반영, 정책 필터는 반영 안 함)
  const searchedItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.fileName?.toLowerCase().includes(keyword));
  }, [items, query]);

  const policyCounts = useMemo(() => {
    const counts: Record<PolicyFilter, number> = { ALL: searchedItems.length, BLOCK: 0, REVIEW: 0, PASS: 0 };
    searchedItems.forEach((item) => {
      if (item.policyDecision === "BLOCK" || item.policyDecision === "REVIEW" || item.policyDecision === "PASS") {
        counts[item.policyDecision] += 1;
      }
    });
    return counts;
  }, [searchedItems]);

  const visibleItems = useMemo(() => {
    const filtered =
      policyFilter === "ALL"
        ? searchedItems
        : searchedItems.filter((item) => item.policyDecision === policyFilter);
    return [...filtered].sort((a, b) =>
      sortKey === "findings"
        ? (b.criticalCount ?? 0) - (a.criticalCount ?? 0) ||
          (b.totalFindings ?? 0) - (a.totalFindings ?? 0)
        : b.fileSeq - a.fileSeq,
    );
  }, [searchedItems, policyFilter, sortKey]);

  // 모든 행을 같은 눈금으로 비교하도록 가장 많은 건수 기준
  const maxFindings = Math.max(...visibleItems.map((item) => item.totalFindings ?? 0), 1);
  const openResult = (fileSeq: number) => navigate(`/scan-result/${fileSeq}`);

  const renderBody = () => {
    if (isLoading) return <div style={styles.empty}>분석 이력을 불러오는 중입니다.</div>;
    if (errorMessage) return <div style={styles.empty}>{errorMessage}</div>;
    if (items.length === 0) return <div style={styles.empty}>아직 분석한 파일이 없습니다.</div>;
    if (visibleItems.length === 0) return <div style={styles.empty}>조건에 맞는 파일이 없습니다.</div>;

    return (
      <>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "30%" }}>파일</th>
              <th style={{ ...styles.th, width: "17%" }}>업로드일</th>
              <th style={{ ...styles.th, width: "10%" }}>구성요소</th>
              <th style={{ ...styles.th, width: "24%" }}>취약점</th>
              <th style={{ ...styles.th, width: "13%" }}>정책 판정</th>
              <th style={{ ...styles.th, width: "6%" }} aria-label="결과 보기" />
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const statusChip = getStatusChip(item.status);
              const total = item.totalFindings ?? 0;
              return (
                <tr
                  key={item.fileSeq}
                  style={styles.row}
                  onClick={() => openResult(item.fileSeq)}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={styles.td}>
                    <div style={styles.fileName}>
                      <span style={styles.fileNameText} title={item.fileName}>
                        {item.fileName}
                      </span>
                      {statusChip && (
                        <span style={{ ...styles.chip, ...styles.statusChip, ...statusChip.style }}>
                          {statusChip.label}
                        </span>
                      )}
                    </div>
                    <div style={styles.muted}>
                      #{item.fileSeq} · {formatBytes(item.fileSize)}
                    </div>
                  </td>
                  <td style={styles.td}>{formatDate(item.uploadDate)}</td>
                  <td style={styles.td}>{(item.componentCount ?? 0).toLocaleString()}개</td>
                  <td style={styles.td}>
                    {/* 분석이 안 끝난 파일은 0건처럼 보이지 않게 "-" */}
                    {statusChip ? (
                      <span style={styles.muted}>-</span>
                    ) : total === 0 ? (
                      <span style={styles.noFinding}>발견 없음</span>
                    ) : (
                      <div style={styles.findingCell}>
                        <StackedBar segments={fileSegments(item)} scaleMax={maxFindings} unit="건" height={8} />
                        <span style={styles.total}>{total}건</span>
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    {item.policyDecisionLabel ? (
                      <span style={{ ...styles.chip, ...getPolicyChipStyle(item.policyDecision) }}>
                        {item.policyDecisionLabel}
                      </span>
                    ) : (
                      <span style={styles.muted}>-</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button
                      type="button"
                      aria-label={`${item.fileName} 결과 보기`}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "inline-flex" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openResult(item.fileSeq);
                      }}
                    >
                      <ChevronRight size={18} color="#94a3b8" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 취약점 막대 색 설명 */}
        <div style={styles.legend}>
          <span style={{ fontWeight: 700 }}>취약점 막대</span>
          {severitySeries.slice(0, 4).map((s) => (
            <span key={s.key} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </>
    );
  };

  return (
    <main style={styles.page}>
      <Topbar />

      <div style={styles.content}>
        <section style={styles.header}>
          <div>
            <h1 style={styles.title}>분석 히스토리</h1>
            <p style={styles.subtitle}>
              업로드한 SBOM/ZIP 분석 이력과 위험도를 한 번에 확인합니다.
            </p>
          </div>
          <div style={styles.buttonGroup}>
            <button type="button" style={styles.button} onClick={() => navigate("/dashboard")}>
              <LayoutDashboard size={16} />
              대시보드
            </button>
            <button type="button" style={styles.primaryButton} onClick={() => navigate("/upload")}>
              <Plus size={16} />
              새 파일 분석
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="파일명 검색"
                aria-label="파일명 검색"
                style={styles.searchInput}
              />
            </div>

            <div style={styles.tabs} role="tablist" aria-label="정책 판정 필터">
              {policyTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={policyFilter === tab.key}
                  style={{ ...styles.tab, ...(policyFilter === tab.key ? styles.tabActive : {}) }}
                  onClick={() => setPolicyFilter(tab.key)}
                >
                  {tab.label}
                  <span style={styles.tabCount}>{policyCounts[tab.key]}</span>
                </button>
              ))}
            </div>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="정렬"
              style={styles.sortSelect}
            >
              <option value="latest">최신순</option>
              <option value="findings">위험한 순</option>
            </select>
          </div>

          {renderBody()}
        </section>
      </div>
    </main>
  );
}
