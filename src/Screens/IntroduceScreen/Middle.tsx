import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CircleCheck } from "lucide-react";
import { middleStyles } from "../../styles/middle";
import { introStyles } from "../../styles/introduce";

// 수치는 실제 서비스 기준 값만 사용 (심각도 5단계, 정책 판정 3종, 업로드 형식 6종)
const stats = [
  { value: "6종", label: "지원 업로드 형식" },
  { value: "5단계", label: "취약점 심각도 분류" },
  { value: "3단계", label: "배포 정책 판정 (PASS·REVIEW·BLOCK)" },
];

const checks = [
  "SPDX · CycloneDX 표준 SBOM 파일 분석",
  "ZIP 프로젝트 업로드 시 구성요소 자동 추출",
  "npm 취약 패키지 자동 수정 ZIP 제공",
  "분석 결과 PDF 보고서 다운로드",
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
          SBOM 또는 프로젝트 ZIP을 업로드하면 오픈소스 구성요소를 추출하고,
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
