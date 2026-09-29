import { CheckCircle2, GitPullRequest, Lock, X } from "lucide-react";
import { useState } from "react";
import {
  createGithubPr,
  getGithubRepos,
  type GithubPrResult,
  type GithubRepo,
} from "../../services/_private/GithubApi";
import { scanResultStyles as styles } from "../../styles/scanResult";

type GithubPrModalProps = {
  fileSeq: string | number;
  onClose: () => void;
};

type Step = "token" | "repos" | "result";

// GitHub PAT는 이 컴포넌트의 지역 state에만 존재한다. localStorage/sessionStorage에 저장하지 않고,
// 모달이 닫히면(언마운트되면) 그대로 사라진다 - 요청 단위로만 쓰고 버리기 위함.
export function GithubPrModal({ fileSeq, onClose }: GithubPrModalProps) {
  const [step, setStep] = useState<Step>("token");
  const [token, setToken] = useState("");
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [creatingPr, setCreatingPr] = useState(false);
  const [error, setError] = useState("");
  const [prResult, setPrResult] = useState<GithubPrResult | null>(null);

  const extractErrorMessage = (err: unknown, fallback: string) => {
    const axiosLike = err as { response?: { data?: { message?: string } } };
    return axiosLike.response?.data?.message || fallback;
  };

  const handleLoadRepos = async () => {
    if (!token.trim() || loadingRepos) return;
    setError("");
    setLoadingRepos(true);
    try {
      const data = await getGithubRepos(token.trim());
      const repoList: GithubRepo[] = data?.data?.repos ?? [];
      setRepos(repoList);
      setStep("repos");
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          "저장소 목록을 불러오지 못했습니다. 토큰을 다시 확인해주세요.",
        ),
      );
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleCreatePr = async () => {
    if (!selectedRepo || creatingPr) return;
    setError("");
    setCreatingPr(true);
    try {
      const data = await createGithubPr(fileSeq, selectedRepo, token.trim());
      setPrResult(data?.data ?? null);
      setStep("result");
    } catch (err) {
      setError(
        extractErrorMessage(err, "PR을 생성하지 못했습니다. 다시 시도해주세요."),
      );
    } finally {
      setCreatingPr(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>GitHub PR로 자동 수정 올리기</h2>
          <button type="button" style={styles.modalCloseButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.modalBody}>
          {error ? <div style={styles.errorBox}>{error}</div> : null}

          {step === "token" && (
            <>
              <div>
                <label style={styles.formLabel}>GitHub Personal Access Token</label>
                <input
                  type="password"
                  autoComplete="off"
                  placeholder="ghp_로 시작하는 토큰을 입력하세요"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{ ...styles.formInput, marginTop: 6 }}
                />
              </div>
              <p style={styles.formHint}>
                이 토큰은 저장소 목록 조회와 PR 생성에만 사용되며, 서버에 저장되지 않습니다.
                (repo 권한이 있는 토큰이 필요합니다.)
              </p>
              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(!token.trim() || loadingRepos ? styles.disabledButton : {}),
                  justifyContent: "center",
                }}
                disabled={!token.trim() || loadingRepos}
                onClick={handleLoadRepos}
              >
                {loadingRepos ? "저장소 불러오는 중..." : "저장소 불러오기"}
              </button>
            </>
          )}

          {step === "repos" && (
            <>
              <div style={styles.repoList}>
                {repos.length === 0 ? (
                  <div style={{ padding: 14, fontSize: 13, color: "#64748b" }}>
                    접근 가능한 저장소가 없습니다.
                  </div>
                ) : (
                  repos.map((repo) => {
                    const disabled = !repo.canPush;
                    const selected = selectedRepo === repo.fullName;
                    return (
                      <div
                        key={repo.fullName}
                        style={{
                          ...styles.repoItem,
                          ...(selected ? styles.repoItemSelected : {}),
                          ...(disabled ? styles.repoItemDisabled : {}),
                        }}
                        onClick={() => !disabled && setSelectedRepo(repo.fullName)}
                      >
                        <div>
                          <div style={styles.repoName}>{repo.fullName}</div>
                          <div style={styles.repoMeta}>
                            기본 브랜치: {repo.defaultBranch}
                            {disabled ? " · push 권한 없음" : ""}
                          </div>
                        </div>
                        {repo.repoPrivate ? <Lock size={14} color="#94a3b8" /> : null}
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  style={styles.button}
                  onClick={() => setStep("token")}
                >
                  토큰 다시 입력
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.primaryButton,
                    ...(!selectedRepo || creatingPr ? styles.disabledButton : {}),
                    flex: 1,
                    justifyContent: "center",
                  }}
                  disabled={!selectedRepo || creatingPr}
                  onClick={handleCreatePr}
                >
                  <GitPullRequest size={16} />
                  {creatingPr ? "PR 생성 중..." : "PR 생성"}
                </button>
              </div>
            </>
          )}

          {step === "result" && prResult && (
            <div style={styles.successBox}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={18} />
                <strong>PR이 생성되었습니다.</strong>
              </div>
              <a
                href={prResult.prUrl}
                target="_blank"
                rel="noreferrer"
                style={styles.inlineLink}
              >
                여기서 보기 →
              </a>
              {prResult.fixedPackages?.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {prResult.fixedPackages.map((pkg) => (
                    <li key={pkg.pkgName} style={{ fontSize: 13 }}>
                      {pkg.pkgName}: {pkg.currentVersion || "-"} → {pkg.targetVersion}
                      {pkg.viaOverride ? " (overrides로 고정)" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button type="button" style={styles.button} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
