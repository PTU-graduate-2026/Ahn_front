import { axiosInstance } from "../ApiConfig";

/**
 * 서버에 로그아웃을 요청해 세션을 삭제한다.
 * 세션 쿠키는 HttpOnly라 프론트에서 지울 수 없기 때문에, 서버가 세션을 없애야
 * 공용 PC 등에서 로그아웃 후에도 이전 사용자의 정보가 조회되지 않는다.
 * 성공하면 true, 네트워크 오류 등으로 서버에 전달되지 못하면 false.
 */
export const logoutApiCall = async () => {
  try {
    await axiosInstance.post("/logout");
    return true;
  } catch (error: any) {
    console.error("로그아웃 요청 중 에러 발생:", error.response?.data || error.message);
    return false;
  }
};
