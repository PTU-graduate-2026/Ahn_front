import { useNavigate } from "react-router-dom";
import { bottomStyles } from "../../styles/bottom";

const serviceLinks = [
  { label: "파일 업로드", path: "/upload" },
  { label: "분석 히스토리", path: "/history" },
  { label: "대시보드", path: "/dashboard" },
];

export default function Bottom() {
  const navigate = useNavigate();

  return (
    <footer style={bottomStyles.container}>
      <div style={bottomStyles.inner}>
        <div style={bottomStyles.brand}>
          <span style={bottomStyles.logo}>ZCS</span>
          <p style={bottomStyles.brandDesc}>
            Zero Check SBOM — SBOM 기반 오픈소스 취약점 분석 서비스
          </p>
        </div>

        <div style={bottomStyles.linkGroup}>
          <span style={bottomStyles.linkTitle}>서비스</span>
          {serviceLinks.map((link) => (
            <button
              key={link.path}
              type="button"
              style={bottomStyles.link}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      <div style={bottomStyles.copyright}>
        © 2026 ZERO CHECK - SBOM. All rights reserved.
      </div>
    </footer>
  );
}
