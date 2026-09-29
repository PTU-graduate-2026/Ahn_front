import React, { useEffect, useState } from "react";
import Router from "./navigation/Router";
import { axiosInstance } from "./services/_private/ApiConfig";
import { isLoggedIn, clearCurrentUser } from "./utils/currentUser";

export default function App() {
  // localStorage의 "로그인됨" 표시는 브라우저에 영구히 남아있어서, 서버 세션이 만료/소실돼도
  // 화면은 계속 로그인된 것처럼 보이는 문제가 있었다(대시보드 데이터만 조용히 실패).
  // 그래서 라우터를 그리기 전에 실제 세션이 유효한지 한 번 확인하고, 아니면 로그인 플래그를 지운다.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // CSRF 쿠키 워밍업: 로그인 등 첫 POST 전에 XSRF-TOKEN 쿠키를 미리 받아둔다.
      // (Spring Security의 CSRF 토큰은 아무도 안 읽으면 안 내려오는 지연 로딩 방식이라
      // 이 호출이 없으면 앱을 켠 뒤 첫 로그인 요청이 항상 403으로 실패한다.)
      await axiosInstance.get("/csrf").catch(() => {
        // 워밍업 실패해도 앱 자체는 계속 떠야 하니 조용히 무시
      });

      if (isLoggedIn()) {
        try {
          await axiosInstance.get("/session");
        } catch {
          // 서버 세션이 없거나 만료됨 -> 로컬에 남아있던 "로그인됨" 표시를 지워서
          // 화면이 실제 상태(로그아웃)와 일치하게 만든다.
          clearCurrentUser();
        }
      }

      setReady(true);
    };
    init();
  }, []);

  if (!ready) return null;

  return (
    <div style={{ minHeight: "100vh", margin: 0 }}>
      <Router />
    </div>
  );
}