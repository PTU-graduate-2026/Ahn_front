// GitHub PAT를 "이 탭이 열려 있는 동안"만 기억하는 메모리 저장소.
// - localStorage/sessionStorage/쿠키에는 절대 저장하지 않는다 (XSS 등으로 디스크·스토리지에서 털리지 않게).
// - 새로고침하거나 탭을 닫으면 사라지고, 로그아웃·세션 만료 시 clearCurrentUser()에서 함께 지운다.
// - 서버에도 저장하지 않는다 - 요청마다 X-GitHub-Token 헤더로만 보내고 서버는 그 요청 동안만 쓴다.
// 저장소 가져오기 → 자동 수정 PR → 다시 분석까지 토큰을 매번 다시 입력하지 않게 하기 위한 용도.
let githubToken: string | null = null;

export const getGithubToken = () => githubToken;

export const setGithubToken = (token: string) => {
  const trimmed = token.trim();
  githubToken = trimmed ? trimmed : null;
};

export const clearGithubToken = () => {
  githubToken = null;
};
