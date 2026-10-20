import { Link } from "react-router-dom";

// FAQ 아래 마무리 띠 — 버튼 하나만
export default function Cta() {
  return (
    <section className="intro-cta">
      <div className="intro-inner intro-cta__inner">
        <div>
          <h2>배포 전에 한 번 확인해 보세요</h2>
          <p>로그인 후 파일 업로드나 GitHub 저장소로 바로 시작할 수 있습니다.</p>
        </div>
        {/* 로그인 안 되어 있으면 ProtectedRoute가 로그인창으로 보냄 */}
        <Link to="/upload" className="intro-btn intro-btn--primary">
          분석 시작하기
        </Link>
      </div>
    </section>
  );
}
