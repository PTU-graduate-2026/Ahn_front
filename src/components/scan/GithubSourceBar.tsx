import { ArrowRight, GitBranch, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reanalyzeGithubRepo } from "../../services/_private/GithubApi";
import { getFileStatus, type FileStatus } from "../../services/_private/SbomApi";
import { scanResultStyles as styles } from "../../styles/scanResult";
import { getGithubToken, setGithubToken } from "../../utils/githubTokenStore";

type GithubSourceBarProps = {
  fileSeq: string | number;
};

const extractErrorMessage = (err: unknown, fallback: string) => {
  const axiosLike = err as { response?: { data?: { message?: string } } };
  return axiosLike.response?.data?.message || fallback;
};

const shortSha = (sha?: string | null) => (sha ? sha.slice(0, 7) : "-");

// 분석 결과 화면 상단의 "GitHub 저장소 연결" 표시줄.
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
        // 출처 정보를 못 가져오면 표시줄만 숨긴다 (결과 화면 자체는 정상 동작).
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

  return (
    <section style={{ ...styles.panel, marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <GitBranch size={18} color="#2563eb" />
          <strong style={{ fontSize: 14 }}>{repoFullName}</strong>
          <span style={styles.smallPill}>{status.repoBranch || "기본 브랜치"}</span>
          <a
            href={`https://github.com/${repoFullName}/commit/${status.repoCommitSha ?? ""}`}
            target="_blank"
            rel="noreferrer"
            style={{ ...styles.inlineLink, ...styles.mono, fontSize: 12 }}
          >
            커밋 {shortSha(status.repoCommitSha)}
          </a>
        </div>
        <button
          type="button"
          style={{ ...styles.button, ...(reanalyzing ? styles.disabledButton : {}) }}
          disabled={reanalyzing}
          onClick={handleReanalyzeClick}
        >
          <RefreshCw size={16} />
          {reanalyzing ? "저장소 가져오는 중..." : "다시 분석"}
        </button>
      </div>

      {hasComparison && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 12,
            fontSize: 13,
            color: "#334155",
          }}
        >
          <span>
            이전 분석 #{status.prevFileSeq} (커밋 {shortSha(status.prevCommitSha)}) 대비 취약점
          </span>
          <strong>{prevCount}건</strong>
          <ArrowRight size={14} />
          <strong>{currentCount}건</strong>
          {reductionRate !== null && (
            <span style={{ color: reductionRate >= 0 ? "#15803d" : "#b91c1c", fontWeight: 700 }}>
              ({reductionRate >= 0 ? `${reductionRate}% 감소` : `${Math.abs(reductionRate)}% 증가`})
            </span>
          )}
          <button
            type="button"
            style={{ ...styles.inlineLink, border: "none", background: "none", cursor: "pointer", padding: 0 }}
            onClick={() => navigate(`/scan-result/${status.prevFileSeq}`)}
          >
            이전 결과 보기
          </button>
        </div>
      )}

      <p style={{ ...styles.formHint, marginTop: 10 }}>
        자동 수정 PR을 머지한 뒤 &quot;다시 분석&quot;을 누르면 저장소의 최신 코드를 새로 가져와 수정 전·후를
        비교합니다.
      </p>

      {error ? <div style={{ ...styles.errorBox, marginTop: 10 }}>{error}</div> : null}

      {needToken && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            type="password"
            autoComplete="off"
            placeholder="GitHub 토큰 (ghp_...)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && token.trim() && runReanalyze(token.trim())}
            style={{ ...styles.formInput, flex: 1 }}
          />
          <button
            type="button"
            style={{
              ...styles.primaryButton,
              ...(!token.trim() || reanalyzing ? styles.disabledButton : {}),
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
