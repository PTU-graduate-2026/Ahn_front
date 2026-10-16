import { CheckCircle2, GitBranch, GitPullRequest, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createGithubPr,
  getGithubRepos,
  type GithubPrResult,
  type GithubRepo,
} from "../../services/_private/GithubApi";
import { getFileStatus } from "../../services/_private/SbomApi";
import { scanResultStyles as styles } from "../../styles/scanResult";
import { getGithubToken, setGithubToken } from "../../utils/githubTokenStore";

type GithubPrModalProps = {
  fileSeq: string | number;
  onClose: () => void;
};

// token: 토큰 입력 / repos: 저장소 고르기(파일 업로드 분석) / confirm: 저장소 고정(GitHub에서 가져온 분석) / result: 완료
type Step = "token" | "repos" | "confirm" | "result";

type LinkedRepo = {
  fullName: string;
  branch?: string | null;
  commitSha?: string | null;
};

// GitHub PAT는 서버에 저장하지 않는다. 브라우저에서도 utils/githubTokenStore의 메모리에만 두고
// (localStorage/sessionStorage 사용 안 함) 새로고침·로그아웃하면 사라진다.
// GitHub 저장소에서 가져온 분석이면 PR 대상 저장소를 고를 수 없게 고정한다 - 분석한 프로젝트와
// 다른 저장소에 PR이 올라가 버전을 덮어쓰는 사고를 막기 위함 (백엔드도 같은 검사를 한 번 더 한다).
export function GithubPrModal({ fileSeq, onClose }: GithubPrModalProps) {
  const [step, setStep] = useState<Step>("token");
  const [token, setToken] = useState(() => getGithubToken() ?? "");
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [linkedRepo, setLinkedRepo] = useState<LinkedRepo | null>(null);
  const [checkingSource, setCheckingSource] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [creatingPr, setCreatingPr] = useState(false);
  const [error, setError] = useState("");
  const [prResult, setPrResult] = useState<GithubPrResult | null>(null);

  const extractErrorMessage = (err: unknown, fallback: string) => {
    const axiosLike = err as { response?: { data?: { message?: string } } };
    return axiosLike.response?.data?.message || fallback;
  };

  // 이 분석이 GitHub 저장소에서 가져온 것인지 먼저 확인한다.
  useEffect(() => {
    let cancelled = false;
    const checkSource = async () => {
      try {
        const data = await getFileStatus(fileSeq);
        const status = data?.data;
        if (!cancelled && status?.sourceType === "GITHUB" && status.repoFullName) {
          const linked = {
            fullName: status.repoFullName,
            branch: status.repoBranch,
            commitSha: status.repoCommitSha,
          };
          setLinkedRepo(linked);
          setSelectedRepo(linked.fullName);
          if (getGithubToken()) setStep("confirm");
        }
      } catch {
        // 출처 확인에 실패하면 기존(저장소 선택) 흐름으로 진행한다. 백엔드가 최종 검사를 한다.
      } finally {
        if (!cancelled) setCheckingSource(false);
      }
    };
    checkSource();
    return () => {
      cancelled = true;
    };
  }, [fileSeq]);

  const handleTokenNext = async () => {
    if (!token.trim() || loadingRepos) return;
    setError("");
    if (linkedRepo) {
      // 저장소가 고정이라 목록 조회가 필요 없다. 토큰 유효성은 PR 생성 때 백엔드가 확인한다.
      setGithubToken(token);
      setStep("confirm");
      return;
    }
    setLoadingRepos(true);
    try {
      const data = await getGithubRepos(token.trim());
      const repoList: GithubRepo[] = data?.data?.repos ?? [];
      setRepos(repoList);
      setGithubToken(token);
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

  const prButton = (
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
  );

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

          {checkingSource && (
            <div style={{ fontSize: 13, color: "#64748b" }}>분석 정보를 확인하는 중...</div>
          )}

          {!checkingSource && step === "token" && (
            <>
              {linkedRepo && (
                <div style={styles.formHint}>
                  이 분석은 <strong>{linkedRepo.fullName}</strong> 저장소에서 가져왔습니다. PR도 이
                  저장소로 만들어집니다.
                </div>
              )}
              <div>
                <label style={styles.formLabel}>GitHub Personal Access Token</label>
                <input
                  type="password"
                  autoComplete="off"
                  placeholder="ghp_로 시작하는 토큰을 입력하세요"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTokenNext()}
                  style={{ ...styles.formInput, marginTop: 6 }}
                />
              </div>
              <p style={styles.formHint}>
                이 토큰은 서버에 저장되지 않고, 이 탭이 열려 있는 동안만 기억합니다.
                (repo, workflow 권한이 있는 토큰이 필요합니다.)
              </p>
              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(!token.trim() || loadingRepos ? styles.disabledButton : {}),
                  justifyContent: "center",
                }}
                disabled={!token.trim() || loadingRepos}
                onClick={handleTokenNext}
              >
                {loadingRepos ? "저장소 불러오는 중..." : linkedRepo ? "다음" : "저장소 불러오기"}
              </button>
            </>
          )}

          {!checkingSource && step === "confirm" && linkedRepo && (
            <>
              <div style={{ ...styles.repoList }}>
                <div style={{ ...styles.repoItem, ...styles.repoItemSelected, cursor: "default" }}>
                  <div>
                    <div style={styles.repoName}>{linkedRepo.fullName}</div>
                    <div style={styles.repoMeta}>
                      <GitBranch size={12} style={{ verticalAlign: "-2px" }} />{" "}
                      {linkedRepo.branch || "기본 브랜치"}
                      {linkedRepo.commitSha ? ` · 분석한 커밋 ${linkedRepo.commitSha.slice(0, 7)}` : ""}
                    </div>
                  </div>
                </div>
              </div>
              <p style={styles.formHint}>
                분석한 저장소로 PR 대상이 고정되어 있습니다. 분석 이후 저장소에 새 커밋이 생겼다면
                결과 화면에서 &quot;다시 분석&quot;을 먼저 해주세요.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" style={styles.button} onClick={() => setStep("token")}>
                  토큰 다시 입력
                </button>
                {prButton}
              </div>
            </>
          )}

          {!checkingSource && step === "repos" && (
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
              <p style={styles.formHint}>
                업로드한 파일과 같은 프로젝트가 들어 있는 저장소를 골라주세요. 다른 프로젝트의 저장소에
                올리면 그 저장소의 의존성 버전이 잘못 바뀝니다.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  style={styles.button}
                  onClick={() => setStep("token")}
                >
                  토큰 다시 입력
                </button>
                {prButton}
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
              {linkedRepo && (
                <div style={{ fontSize: 13 }}>
                  GitHub에서 Checks를 확인하고 머지한 뒤, 결과 화면의 &quot;다시 분석&quot;으로 수정 효과를
                  확인하세요.
                </div>
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
