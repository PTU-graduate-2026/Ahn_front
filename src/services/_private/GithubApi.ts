import { axiosInstance } from "./ApiConfig";

export type GithubRepo = {
  fullName: string;
  name: string;
  ownerLogin: string;
  repoPrivate: boolean;
  defaultBranch: string;
  canPush: boolean;
};

export type FixedPackageInfo = {
  pkgName: string;
  pkgType?: string;
  currentVersion?: string;
  targetVersion?: string;
  severity?: string;
  vulnId?: string;
  viaOverride: boolean;
};

export type GithubPrResult = {
  prUrl: string;
  prNumber: number;
  branch: string;
  fixedPackages: FixedPackageInfo[];
};

// GitHub PAT는 이 요청 헤더로만 전달한다. 여기서도 변수에 잠깐 머무를 뿐,
// 어디에도 저장(localStorage 등)하지 않고 호출이 끝나면 버려진다.
const githubTokenHeader = (token: string) => ({
  headers: { "X-GitHub-Token": token },
});

export const getGithubRepos = async (token: string) => {
  const response = await axiosInstance.get("/github/repos", githubTokenHeader(token));
  return response.data;
};

export type GithubAnalyzeResult = {
  fileSeq: number;
  fileName: string;
  status: string;
  repoFullName: string;
  repoBranch: string;
  repoCommitSha: string;
  prevFileSeq?: number | null;
};

// 저장소를 직접 가져와 분석 시작 (기본 브랜치 최신 커밋 기준)
export const analyzeGithubRepo = async (repoFullName: string, token: string) => {
  const response = await axiosInstance.post(
    "/github/analyze",
    { repoFullName },
    githubTokenHeader(token),
  );
  return response.data;
};

// GitHub에서 가져온 분석 기록을 저장소의 현재 최신 커밋으로 다시 분석 (새 기록이 만들어짐)
export const reanalyzeGithubRepo = async (fileSeq: string | number, token: string) => {
  const response = await axiosInstance.post(
    `/files/${fileSeq}/github-reanalyze`,
    {},
    githubTokenHeader(token),
  );
  return response.data;
};

export const createGithubPr = async (
  fileSeq: string | number,
  repoFullName: string,
  token: string,
) => {
  const response = await axiosInstance.post(
    `/files/${fileSeq}/github-pr`,
    { repoFullName },
    githubTokenHeader(token),
  );
  return response.data;
};
