import { axiosInstance } from "../ApiConfig";

// 회원 탈퇴 본인확인 수단. 둘 중 하나만 보낸다.
//  - membPwd: 아이디/비밀번호로 가입한 계정
//  - idToken: 구글로 가입한 계정 (구글 로그인으로 다시 확인)
export type WithdrawCredential = {
  membPwd?: string;
  idToken?: string;
};

// 비밀번호가 틀려도 서버는 401이 아니라 success:false로 응답한다
// (401이면 ApiConfig 인터셉터가 로그아웃시켜 버리므로).
export const withdrawMember = async (credential: WithdrawCredential) => {
  const response = await axiosInstance.post("/members/me/withdraw", credential);
  return response.data;
};
