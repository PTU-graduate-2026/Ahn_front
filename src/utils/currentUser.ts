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

export const isLoggedIn = () => {
  return getCurrentMembSeq() !== null;
};

export const logout = () => {
  clearCurrentUser();
  const google = (window as any).google;
  if (google?.accounts?.id?.disableAutoSelect) {
    google.accounts.id.disableAutoSelect();
  }
};
