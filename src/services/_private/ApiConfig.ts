// src/services/Api.config.ts
import axios from "axios";
import { clearCurrentUser, getAccessToken } from "../../utils/currentUser";

// 1. 서버 주소를 변수로 선언 (나중에 여기만 고치면 끝!) 현재 내 인텔주소
export const BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:18080/api";

// 2. 공용 트럭 생성
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

// 3. 모든 요청에 로그인 토큰을 자동으로 붙인다
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 4. 토큰이 만료되었거나 없으면(401) 로그인 정보를 지우고 로그인 화면으로 보낸다
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearCurrentUser();
      if (window.location.pathname !== "/login") {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

// axios 오류에서 백엔드가 보낸 메시지를 꺼낸다 (blob 응답도 처리)
export const getErrorMessage = async (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed?.message || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message || fallback;
};
