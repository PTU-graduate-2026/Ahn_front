// src/services/Api.config.ts

// 1. 서버 주소를 변수로 선언 (나중에 여기만 고치면 끝!) 현재 내 인텔주소
export const BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:18080/api";

import axios from "axios";
import { clearCurrentUser, isLoggedIn } from "../../utils/currentUser";

// 2. 공용 트럭 생성
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  withCredentials: true, // 로그인 세션 쿠키(JSESSIONID)를 요청마다 자동으로 실어 보낸다
  withXSRFToken: true, // 백엔드가 다른 origin(포트)이라 axios가 XSRF-TOKEN 쿠키를 자동으로 못 읽는데, 이걸 켜야 읽어서 X-XSRF-TOKEN 헤더로 보내준다
});

// App.tsx의 세션 체크는 "앱을 처음 켰을 때" 딱 한 번만 실행된다.
// 브라우저 탭을 계속 켜둔 채로 서버 세션이 나중에(재시작, 만료 등으로) 끊기면
// 화면은 계속 로그인 상태로 보이는데 API 호출만 401로 조용히 실패하는 문제가 있었다
// (2026-09-14 밤 EC2 작업 중 재현됨 — LEARNING_NOTES 19번 부록 참고).
// 그래서 로그인 이후 어떤 API 호출이든 401을 받으면 그 시점에 바로 로그인 표시를 지우고
// 로그인 화면으로 돌려보낸다 — "탭을 얼마나 오래 켜뒀는지"와 무관하게 항상 실제 세션 상태와 화면을 맞추기 위함.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && isLoggedIn()) {
      clearCurrentUser();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
