import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CircleCheck } from "lucide-react";
import { middleStyles } from "../../styles/middle";
import { introStyles } from "../../styles/introduce";

// 수치는 실제 서비스 기준 값만 사용 (분석 방식 2가지, 심각도 5단계, 정책 판정 3종)
const stats = [
  { value: "2가지", label: "분석 방식 (파일 업로드 · GitHub)" },
  { value: "5단계", label: "취약점 심각도 분류" },
  { value: "3단계", label: "배포 정책 판정 (PASS·REVIEW·BLOCK)" },
];

const checks = [
  "SPDX · CycloneDX 표준 SBOM 파일 분석",
  "GitHub 저장소를 골라 최신 커밋 바로 분석",
  "npm 취약 패키지 자동 수정 ZIP · GitHub PR",
  "분석자 정보가 담긴 PDF 보고서 다운로드",
];

export default function Middle() {
  const navigate = useNavigate();

  // 핵심 기능 섹션으로 부드럽게 스크롤
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section style={middleStyles.container}>
      <div style={middleStyles.content}>
        <span style={middleStyles.badge}>
          <span style={middleStyles.badgeDot} />
          SBOM 기반 오픈소스 취약점 분석 서비스
        </span>

        <h1 style={middleStyles.title}>ZERO CHECK - SBOM</h1>
        <p style={middleStyles.headline}>
          소프트웨어 공급망 보안, 파일 하나로 점검하세요
        </p>
        <p style={middleStyles.subTitle}>
          SBOM · 프로젝트 ZIP을 업로드하거나 GitHub 저장소를 고르면 오픈소스 구성요소를 추출하고,
          알려진 취약점(CVE)을 찾아 배포 가능 여부를 판정합니다.
        </p>

        <div style={middleStyles.buttons}>
          {/* 로그인 안 되어 있으면 ProtectedRoute가 로그인창으로 보냄 */}
          <button type="button" style={introStyles.primaryButton} onClick={() => navigate("/upload")}>
            분석 시작하기 <ArrowRight size={18} />
          </button>
          <button type="button" style={introStyles.outlineButton} onClick={scrollToFeatures}>
            기능 알아보기
          </button>
        </div>

        <div style={middleStyles.statRow}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{ ...middleStyles.stat, ...(i > 0 ? middleStyles.statDivider : {}) }}
            >
              <span style={middleStyles.statValue}>{stat.value}</span>
              <span style={middleStyles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        <ul style={middleStyles.checkList}>
          {checks.map((text) => (
            <li key={text} style={middleStyles.checkItem}>
              <CircleCheck size={18} style={middleStyles.checkIcon} />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
