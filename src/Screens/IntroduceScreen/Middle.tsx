import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

// 첫 등장 순서 — CSS에서 --i × 50ms 만큼 늦게 나타남
const rise = (i: number) => ({ "--i": i }) as CSSProperties;

// 히어로: 브랜드명 · 제목 · 설명 · 버튼만 (파스텔 배경, 가운데 정렬)
export default function Middle() {
  return (
    <section className="intro-hero">
      <div className="intro-inner intro-hero__body">
        <p className="intro-hero__label intro-rise" style={rise(0)} translate="no">
          ZERO CHECK - SBOM
        </p>
        <h1 className="intro-hero__title intro-rise" style={rise(1)}>
          오픈소스 취약점,
          <br />
          <em>배포 전에</em> 확인하세요
        </h1>
        <p className="intro-hero__lede intro-rise" style={rise(2)}>
          프로젝트에 들어 있는 오픈소스 패키지를 찾아 알려진 취약점(CVE)과 비교하고, 배포해도 되는지
          판정합니다.
        </p>
        <div className="intro-hero__actions intro-rise" style={rise(3)}>
          {/* 로그인 안 되어 있으면 ProtectedRoute가 로그인창으로 보냄 */}
          <Link to="/upload" className="intro-btn intro-btn--primary">
            분석 시작하기
          </Link>
          <a href="#stages" className="intro-btn intro-btn--secondary">
            이용 방법 보기
          </a>
        </div>
      </div>
    </section>
  );
}
