import Topbar from "./Topbar";
import Middle from "./Middle";
import Process from "./Process";
import Features from "./Features";
import Faq from "./Faq";
import Cta from "./Cta";
import Bottom from "./Bottom";
import "../../styles/introduce.css";

// 소개화면: 히어로(판정 기준) → 이용 단계 → 지원 범위 → FAQ → 시작 안내 → 푸터
export default function Introduce() {
  return (
    <div className="intro" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a href="#intro-main" className="intro-skip">
        본문으로 건너뛰기
      </a>
      <Topbar />
      <main id="intro-main" style={{ flex: 1 }}>
        <Middle />
        <Process />
        <Features />
        <Faq />
        <Cta />
      </main>
      <Bottom />
    </div>
  );
}
