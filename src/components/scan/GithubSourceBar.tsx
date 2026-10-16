import type { CSSProperties } from "react";
import { ArrowRight, ExternalLink, GitBranch, GitCommitHorizontal, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reanalyzeGithubRepo } from "../../services/_private/GithubApi";
import { getFileStatus, type FileStatus } from "../../services/_private/SbomApi";
import { scanResultStyles as base } from "../../styles/scanResult";
import { getGithubToken, setGithubToken } from "../../utils/githubTokenStore";

type GithubSourceBarProps = {
  fileSeq: string | number;
};

const mono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

// 결과 화면의 다른 카드(위험도 개요 등)와 같은 톤: 흰 바탕 + 왼쪽 색 띠 + 둥근 아이콘
const styles: Record<string, CSSProperties> = {
  card: {
    marginBottom: 18,
    borderRadius: 10,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderLeft: "4px solid #1f4e8c",
    padding: "18px 22px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "rgba(31, 78, 140, 0.08)",
    color: "#1f4e8c",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  repoName: {
    fontSize: 17,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: -0.2,
    wordBreak: "break-all",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    padding: "0 9px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
  },
  commitChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    padding: "0 9px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: mono,
    textDecoration: "none",
  },
  desc: {
    margin: 0,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  compare: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 8,
    background: "#f8fafc",
    border: "1px solid #eef2f7",
    fontSize: 13,
    color: "#334155",
  },
  compareLabel: {
    fontWeight: 700,
    color: "#64748b",
  },
  compareCount: {
    fontSize: 15,
    fontWeight: 900,
    color: "#0f172a",
  },
  ratePill: {
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  linkButton: {
    marginLeft: "auto",
    padding: 0,
    border: "none",
    background: "none",
    color: "#1f4e8c",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  tokenRow: {
    display: "flex",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid #f1f5f9",
  },
  tokenInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  },
  error: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 8,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: 13,
  },
};

const extractErrorMessage = (err: unknown, fallback: string) => {
  const axiosLike = err as { response?: { data?: { message?: string } } };
  return axiosLike.response?.data?.message || fallback;
};

const shortSha = (sha?: string | null) => (sha ? sha.slice(0, 7) : "-");

// 분석 결과 화면 상단의 "GitHub 저장소 연결" 카드.
// - GitHub에서 가져온 분석일 때만 보인다 (파일 업로드 분석이면 아무것도 그리지 않음).
// - "다시 분석": PR을 머지한 뒤 저장소의 최신 커밋을 다시 가져와 새 분석 기록을 만든다.
// - 다시 분석으로 만들어진 기록이면 직전 분석과 취약점 수를 비교해 보여준다 (수정 전·후).
export function GithubSourceBar({ fileSeq }: GithubSourceBarProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<FileStatus | null>(null);
  const [needToken, setNeedToken] = useState(false);
  const [token, setToken] = useState("");
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus(null);
    setNeedToken(false);
    setError("");
    getFileStatus(fileSeq)
      .then((data) => {
        if (!cancelled) setStatus((data?.data as FileStatus) ?? null);
      })
      .catch(() => {
        // 출처 정보를 못 가져오면 카드만 숨긴다 (결과 화면 자체는 정상 동작).
      });
    return () => {
      cancelled = true;
    };
  }, [fileSeq]);

  if (!status || status.sourceType !== "GITHUB" || !status.repoFullName) {
    return null;
  }

  const repoFullName = status.repoFullName;
  const currentCount = status.scanCount ?? 0;
  const hasComparison = status.prevFileSeq != null && status.prevScanCount != null;
  const prevCount = status.prevScanCount ?? 0;
  const reductionRate =
    hasComparison && prevCount > 0
      ? Math.round(((prevCount - currentCount) / prevCount) * 1000) / 10
      : null;

  const runReanalyze = async (tokenToUse: string) => {
    if (reanalyzing) return;
    setError("");
    setReanalyzing(true);
    try {
      const data = await reanalyzeGithubRepo(fileSeq, tokenToUse);
      const newSeq = data?.data?.fileSeq;
      if (data?.success && newSeq) {
        setGithubToken(tokenToUse);
        navigate(`/scan-loading/${newSeq}`);
        return;
      }
      setError(data?.message || "다시 분석을 시작하지 못했습니다.");
    } catch (err) {
      setError(extractErrorMessage(err, "다시 분석을 시작하지 못했습니다. 토큰을 확인해주세요."));
      setNeedToken(true);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleReanalyzeClick = () => {
    const saved = getGithubToken();
    if (saved) {
      runReanalyze(saved);
    } else {
      setNeedToken(true);
    }
  };

  const rateStyle =
    reductionRate === null
      ? null
      : reductionRate >= 0
        ? { ...styles.ratePill, background: "#dcfce7", color: "#15803d" }
        : { ...styles.ratePill, background: "#fee2e2", color: "#b91c1c" };

  return (
    <section style={styles.card}>
      <div style={styles.row}>
        <div style={styles.iconWrap}>
          <GitBranch size={22} />
        </div>

        <div style={styles.body}>
          <span style={styles.label}>GitHub 저장소에서 가져온 분석</span>
          <div style={styles.titleRow}>
            <span style={styles.repoName}>{repoFullName}</span>
            <span style={styles.chip}>
              <GitBranch size={12} />
              {status.repoBranch || "기본 브랜치"}
            </span>
            <a
              href={`https://github.com/${repoFullName}/commit/${status.repoCommitSha ?? ""}`}
              target="_blank"
              rel="noreferrer"
              style={styles.commitChip}
              title="GitHub에서 이 커밋 보기"
            >
              <GitCommitHorizontal size={12} />
              {shortSha(status.repoCommitSha)}
              <ExternalLink size={11} />
            </a>
          </div>
          <p style={styles.desc}>
            자동 수정 PR을 머지한 뒤 다시 분석하면 저장소의 최신 코드로 수정 전·후를 비교합니다.
          </p>
        </div>

        <button
          type="button"
          style={{ ...base.button, flexShrink: 0, ...(reanalyzing ? base.disabledButton : {}) }}
          disabled={reanalyzing}
          onClick={handleReanalyzeClick}
        >
          <RefreshCw size={16} />
          {reanalyzing ? "가져오는 중..." : "다시 분석"}
        </button>
      </div>

      {hasComparison && (
        <div style={styles.compare}>
          <span style={styles.compareLabel}>
            이전 분석 #{status.prevFileSeq} · {shortSha(status.prevCommitSha)}
          </span>
          <span style={styles.compareCount}>{prevCount}건</span>
          <ArrowRight size={14} color="#94a3b8" />
          <span style={styles.compareCount}>{currentCount}건</span>
          {rateStyle && reductionRate !== null && (
            <span style={rateStyle}>
              {reductionRate >= 0 ? `▼ ${reductionRate}% 감소` : `▲ ${Math.abs(reductionRate)}% 증가`}
            </span>
          )}
          <button
            type="button"
            style={styles.linkButton}
            onClick={() => navigate(`/scan-result/${status.prevFileSeq}`)}
          >
            이전 결과 보기 →
          </button>
        </div>
      )}

      {error ? <div style={styles.error}>{error}</div> : null}

      {needToken && (
        <div style={styles.tokenRow}>
          <input
            type="password"
            autoComplete="off"
            placeholder="다시 분석하려면 GitHub 토큰을 입력하세요 (ghp_...)"
            aria-label="GitHub Personal Access Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && token.trim() && runReanalyze(token.trim())}
            style={styles.tokenInput}
          />
          <button
            type="button"
            style={{
              ...base.primaryActionButton,
              ...(!token.trim() || reanalyzing ? base.disabledButton : {}),
            }}
            disabled={!token.trim() || reanalyzing}
            onClick={() => runReanalyze(token.trim())}
          >
            확인
          </button>
        </div>
      )}
    </section>
  );
}
