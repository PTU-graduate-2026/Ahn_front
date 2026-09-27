const MEMBER_SEQ_KEY = "zcs_memb_seq";
const MEMBER_NAME_KEY = "zcs_memb_name";
const ACCESS_TOKEN_KEY = "zcs_access_token";
const TOKEN_EXPIRES_AT_KEY = "zcs_token_expires_at";

// 로그인 API 응답의 data 부분
export type LoginData = {
  membSeq: number;
  membNm?: string;
  accessToken: string;
  expiresIn?: number; // 초 단위
};

export const getCurrentMembSeq = () => {
  const savedMembSeq = window.localStorage.getItem(MEMBER_SEQ_KEY);
  return savedMembSeq ? Number(savedMembSeq) : null;
};

export const setCurrentUser = ({ membSeq, membNm, accessToken, expiresIn }: LoginData) => {
  window.localStorage.setItem(MEMBER_SEQ_KEY, String(membSeq));
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (membNm) window.localStorage.setItem(MEMBER_NAME_KEY, membNm);
  if (expiresIn) {
    window.localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000));
  }
};

export const getCurrentUserName = () => {
  return window.localStorage.getItem(MEMBER_NAME_KEY);
};

// 만료된 토큰은 없는 것으로 본다
export const getAccessToken = () => {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;

  const expiresAt = Number(window.localStorage.getItem(TOKEN_EXPIRES_AT_KEY));
  if (expiresAt && Date.now() >= expiresAt) {
    clearCurrentUser();
    return null;
  }
  return token;
};

export const clearCurrentUser = () => {
  window.localStorage.removeItem(MEMBER_SEQ_KEY);
  window.localStorage.removeItem(MEMBER_NAME_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
};

export const logout = () => {
  clearCurrentUser();
  // 구글이 "이전에 이 계정으로 로그인했음"을 기억해서 로그인 화면에
  // 계정이 자동으로 떠버리는 걸 방지 (로그아웃 시 구글 측 기억 상태 초기화)
  const google = (window as any).google;
  if (google?.accounts?.id?.disableAutoSelect) {
    google.accounts.id.disableAutoSelect();
  }
};

// 토큰이 있어야 로그인 상태 (예전 방식으로 membSeq만 저장된 경우는 다시 로그인해야 함)
export const isLoggedIn = () => {
  return getAccessToken() !== null;
};
