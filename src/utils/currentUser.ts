const MEMBER_SEQ_KEY = "zcs_memb_seq";
const MEMBER_NAME_KEY = "zcs_memb_name";

export const getCurrentMembSeq = () => {
  const savedMembSeq = window.localStorage.getItem(MEMBER_SEQ_KEY);
  return savedMembSeq ? Number(savedMembSeq) : null;
};

export const setCurrentUser = (membSeq: number, membNm?: string) => {
  window.localStorage.setItem(MEMBER_SEQ_KEY, String(membSeq));
  if (membNm) window.localStorage.setItem(MEMBER_NAME_KEY, membNm);
};

export const getCurrentUserName = () => {
  return window.localStorage.getItem(MEMBER_NAME_KEY);
};

export const clearCurrentUser = () => {
  window.localStorage.removeItem(MEMBER_SEQ_KEY);
  window.localStorage.removeItem(MEMBER_NAME_KEY);
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

export const isLoggedIn = () => {
  return getCurrentMembSeq() !== null;
};
