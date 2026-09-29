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
