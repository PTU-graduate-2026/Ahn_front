import { ArrowRight, FolderGit2, GitBranch, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  analyzeGithubRepo,
  getGithubRepos,
  type GithubRepo,
} from "../services/_private/GithubApi";
import { fileUploadStyles as s } from "../styles/fileUpload";
import { isLoggedIn } from "../utils/currentUser";
import { getGithubToken, setGithubToken } from "../utils/githubTokenStore";

const extractErrorMessage = (err: unknown, fallback: string) => {
  const axiosLike = err as { response?: { data?: { message?: string } } };
  return axiosLike.response?.data?.message || fallback;
};

// 업로드 화면의 "GitHub 저장소" 탭. 파일 업로드 카드(FileDropInput)와 같은 모양으로 맞췄다.
// ZIP을 따로 내려받아 올리지 않고, 저장소를 고르면 서버가 최신 커밋을 직접 가져와 분석한다.
// 이렇게 만든 분석 기록은 저장소 정보를 기억하므로, 자동 수정 PR은 항상 이 저장소로만 만들어진다.
export function GithubImportPanel() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => getGithubToken() ?? "");
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const visibleRepos = useMemo(() => {
    if (!repos) return [];
    const q = keyword.trim().toLowerCase();
    return q ? repos.filter((repo) => repo.fullName.toLowerCase().includes(q)) : repos;
  }, [repos, keyword]);

  const ensureLoggedIn = () => {
    if (isLoggedIn()) return true;
    alert("로그인 후 저장소를 분석할 수 있습니다.");
    navigate("/login");
    return false;
  };

  const handleLoadRepos = async () => {
    if (!token.trim() || loadingRepos || !ensureLoggedIn()) return;
    setError("");
    setLoadingRepos(true);
    try {
      const data = await getGithubRepos(token.trim());
      setRepos(data?.data?.repos ?? []);
      setSelectedRepo(null);
      setKeyword("");
      setGithubToken(token); // 이 탭이 열려 있는 동안만 메모리에 기억 (PR·다시 분석 때 재입력 방지)
    } catch (err) {
      setError(extractErrorMessage(err, "저장소 목록을 불러오지 못했습니다. 토큰을 다시 확인해주세요."));
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedRepo || analyzing || !ensureLoggedIn()) return;
    setError("");
    setAnalyzing(true);
    try {
      const data = await analyzeGithubRepo(selectedRepo, token.trim());
      const fileSeq = data?.data?.fileSeq;
      if (data?.success && fileSeq) {
        navigate(`/scan-loading/${fileSeq}`);
        return;
      }
      setError(data?.message || "저장소 분석을 시작하지 못했습니다.");
    } catch (err) {
      setError(extractErrorMessage(err, "저장소 분석을 시작하지 못했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setAnalyzing(false);
    }
  };

  const loadDisabled = !token.trim() || loadingRepos;

  return (
    <div style={s.dropCard}>
      <div style={s.repoIntro}>
        <div style={s.dropIcon}>
          <FolderGit2 size={28} />
        </div>
        <div style={s.dropTitle}>GitHub 저장소를 바로 가져와 분석합니다</div>
        <div style={s.dropHelper}>
          기본 브랜치의 최신 코드를 가져오며, 자동 수정 PR은 이 저장소로만 만들어집니다
        </div>
        <div style={s.tokenRow}>
          <input
            type="password"
            autoComplete="off"
            placeholder="GitHub 토큰 (ghp_...)"
            aria-label="GitHub Personal Access Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLoadRepos()}
            style={s.tokenInput}
          />
          <button
            type="button"
            style={{ ...s.pickButton, marginTop: 0, ...(loadDisabled ? s.primaryBtnDisabled : {}) }}
            disabled={loadDisabled}
            onClick={handleLoadRepos}
          >
            {loadingRepos ? "불러오는 중..." : repos ? "다시 불러오기" : "저장소 불러오기"}
          </button>
        </div>
        <div style={s.tokenHint}>
          repo · workflow 권한 필요 · 토큰은 서버에 저장되지 않고 이 탭이 열려 있는 동안만 기억합니다
        </div>
      </div>

      {error ? <div style={s.errorText}>{error}</div> : null}

      {repos && (
        <>
          <div style={s.listHeader}>
            <span>저장소 {repos.length}개</span>
            {repos.length > 6 && (
              <input
                type="search"
                placeholder="저장소 검색"
                aria-label="저장소 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={s.repoSearch}
              />
            )}
          </div>

          <div style={s.fileList}>
            <div style={s.repoScroll}>
              {visibleRepos.length === 0 ? (
                <div style={s.emptyText}>
                  {repos.length === 0 ? "접근 가능한 저장소가 없습니다." : "검색 결과가 없습니다."}
                </div>
              ) : (
                visibleRepos.map((repo, idx) => {
                  const selected = selectedRepo === repo.fullName;
                  const isLast = idx === visibleRepos.length - 1;
                  return (
                    <div
                      key={repo.fullName}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      style={{
                        ...s.repoRow,
                        ...(isLast ? s.fileRowLast : {}),
                        ...(selected ? s.repoRowSelected : {}),
                      }}
                      onClick={() => setSelectedRepo(repo.fullName)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedRepo(repo.fullName);
                        }
                      }}
                    >
                      <div style={{ ...s.fileIcon, ...(selected ? s.repoIconSelected : {}) }}>
                        <FolderGit2 size={18} />
                      </div>
                      <div style={s.fileMeta}>
                        <div style={s.fileName} title={repo.fullName}>
                          {repo.fullName}
                        </div>
                        <div style={s.fileSize}>
                          <GitBranch size={11} style={{ verticalAlign: "-1px" }} /> {repo.defaultBranch}
                          {repo.canPush ? "" : " · push 권한 없음 (분석만 가능)"}
                        </div>
                      </div>
                      {repo.repoPrivate && (
                        <span style={s.repoBadge}>
                          <Lock size={10} style={{ verticalAlign: "-1px" }} /> Private
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={s.actionRow}>
            <button
              type="button"
              style={{ ...s.primaryBtn, ...(!selectedRepo || analyzing ? s.primaryBtnDisabled : {}) }}
              disabled={!selectedRepo || analyzing}
              onClick={handleAnalyze}
            >
              {analyzing ? (
                "저장소 가져오는 중..."
              ) : (
                <>
                  저장소 분석 시작 <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
