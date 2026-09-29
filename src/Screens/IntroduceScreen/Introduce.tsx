import React from "react";
import Topbar from "./Topbar";
import Middle from "./Middle";
import Features from "./Features";
import Process from "./Process";
import Faq from "./Faq";
import Bottom from "./Bottom";

// 소개화면: 히어로 → 핵심 기능 → 이용 절차 → FAQ → 푸터
export default function Introduce() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Topbar />
      <main style={{ flex: 1 }}>
        <Middle />
        <Features />
        <Process />
        <Faq />
      </main>
      <Bottom />
    </div>
  );
}
