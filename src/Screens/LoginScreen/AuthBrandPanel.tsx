import { useNavigate } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { authStyles as s } from "../../styles/auth";

const brandPoints = [
  "SPDX · CycloneDX SBOM과 프로젝트 ZIP 분석",
  "CVE 취약점 스캔과 배포 정책 판정",
  "자동 수정 ZIP · PDF 보고서 제공",
];

// 로그인/회원가입 왼쪽 남색 브랜드 패널
export default function AuthBrandPanel() {
  const navigate = useNavigate();

  return (
    <aside style={s.brandPanel}>
      <button type="button" style={s.brandLogo} onClick={() => navigate("/")} aria-label="소개 화면으로 이동">
        <span style={s.brandMark}>ZCS</span>
        <span style={s.brandName}>
          Zero Check SBOM
          <br />
          Security Service
        </span>
      </button>

      <div>
        <h2 style={s.brandHeadline}>
          소프트웨어 공급망 보안,
          <br />
          파일 하나로 점검하세요
        </h2>
        <p style={s.brandDesc}>
          SBOM을 업로드하면 오픈소스 구성요소의 알려진 취약점을 찾아 배포 가능 여부를 알려드립니다.
        </p>
        <ul style={s.brandList}>
          {brandPoints.map((point) => (
            <li key={point} style={s.brandItem}>
              <CircleCheck size={18} color="#86b6ef" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div style={s.brandFoot}>© 2026 ZERO CHECK - SBOM</div>
    </aside>
  );
}
