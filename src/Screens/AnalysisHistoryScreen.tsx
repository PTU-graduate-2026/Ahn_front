import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileHistoryItem,
  getFileHistory,
} from "../services/_private/SbomApi";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "56px 72px",
    background: "#f4f7fb",
    color: "#0f172a",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    marginBottom: 32,
  },
  title: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.15,
    fontWeight: 900,
    letterSpacing: 0,
  },
  subtitle: {
    margin: "14px 0 0",
    color: "#64748b",
    fontSize: 17,
    fontWeight: 600,
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
  },
  button: {
    height: 44,
    padding: "0 18px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#1e293b",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  primaryButton: {
    height: 44,
    padding: "0 18px",
    borderRadius: 8,
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#fff",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  card: {
    overflow: "hidden",
    border: "1px solid #dbe3ef",
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "22px 26px",
    borderBottom: "1px solid #e2e8f0",
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
  },
  countBadge: {
    padding: "7px 12px",
    borderRadius: 999,
    background: "#eef4ff",
    color: "#1e3a8a",
    fontSize: 13,
    fontWeight: 900,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  th: {
    padding: "16px 18px",
    background: "#f8fafc",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 14,
    fontWeight: 900,
    textAlign: "left",
  },
  td: {
    padding: "18px",
    borderBottom: "1px solid #eef2f7",
    fontSize: 15,
    fontWeight: 700,
    verticalAlign: "middle",
    wordBreak: "break-word",
  },
  fileName: {
    fontWeight: 900,
  },
  muted: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },
  severityRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  severityBadge: {
    padding: "5px 8px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 12,
    fontWeight: 900,
  },
  dangerBadge: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  warningBadge: {
    background: "#ffedd5",
    color: "#9a3412",
  },
  blockBadge: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  reviewBadge: {
    background: "#fef3c7",
    color: "#92400e",
  },
  passBadge: {
    background: "#dcfce7",
    color: "#166534",
  },
  empty: {
    padding: 42,
    color: "#64748b",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
  },
};

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

const getPolicyBadgeStyle = (decision?: string) => {
  if (decision === "BLOCK") return styles.blockBadge;
  if (decision === "REVIEW") return styles.reviewBadge;
  if (decision === "PASS") return styles.passBadge;
  return styles.severityBadge;
};

export default function AnalysisHistoryScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FileHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.fileSeq - a.fileSeq),
    [items],
  );

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <div>
          <h1 style={styles.title}>분석 히스토리</h1>
          <p style={styles.subtitle}>
            업로드한 SBOM/ZIP 분석 이력과 위험도를 한 번에 확인합니다.
          </p>
        </div>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={() => navigate("/dashboard")}>
            홈
          </button>
          <button style={styles.primaryButton} onClick={() => navigate("/upload")}>
            새 파일 분석
          </button>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>파일 분석 목록</h2>
          <span style={styles.countBadge}>총 {sortedItems.length}건</span>
        </div>

        {isLoading && <div style={styles.empty}>분석 이력을 불러오는 중입니다.</div>}
        {!isLoading && errorMessage && (
          <div style={styles.empty}>{errorMessage}</div>
        )}
        {!isLoading && !errorMessage && sortedItems.length === 0 && (
          <div style={styles.empty}>아직 분석한 파일이 없습니다.</div>
        )}
        {!isLoading && !errorMessage && sortedItems.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "28%" }}>파일명</th>
                <th style={{ ...styles.th, width: "13%" }}>업로드일</th>
                <th style={{ ...styles.th, width: "10%" }}>크기</th>
                <th style={{ ...styles.th, width: "12%" }}>구성요소</th>
                <th style={{ ...styles.th, width: "24%" }}>취약점 / 정책</th>
                <th style={{ ...styles.th, width: "13%" }}>결과</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.fileSeq}>
                  <td style={styles.td}>
                    <div style={styles.fileName}>{item.fileName}</div>
                    <div style={styles.muted}>파일 번호 {item.fileSeq}</div>
                  </td>
                  <td style={styles.td}>{formatDate(item.uploadDate)}</td>
                  <td style={styles.td}>{formatBytes(item.fileSize)}</td>
                  <td style={styles.td}>{item.componentCount ?? 0}개</td>
                  <td style={styles.td}>
                    <div style={styles.severityRow}>
                      <span style={{ ...styles.severityBadge, ...styles.dangerBadge }}>
                        Critical {item.criticalCount ?? 0}
                      </span>
                      <span style={{ ...styles.severityBadge, ...styles.warningBadge }}>
                        High {item.highCount ?? 0}
                      </span>
                      <span style={styles.severityBadge}>
                        Total {item.totalFindings ?? 0}
                      </span>
                      {item.policyDecisionLabel && (
                        <span
                          style={{
                            ...styles.severityBadge,
                            ...getPolicyBadgeStyle(item.policyDecision),
                          }}
                        >
                          {item.policyDecisionLabel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.button}
                      onClick={() => navigate(`/scan-result/${item.fileSeq}`)}
                    >
                      결과 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
