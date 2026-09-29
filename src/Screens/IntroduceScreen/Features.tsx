import React, { useState } from "react";
import { Boxes, FileText, LayoutDashboard, Scale, ShieldAlert, Wrench } from "lucide-react";
import { introStyles } from "../../styles/introduce";

// 핵심 기능 카드 목록 — 항목 추가/수정은 여기만 고치면 됨
const features = [
  {
    icon: Boxes,
    title: "구성요소 자동 추출",
    desc: "SBOM 파일이나 프로젝트 ZIP에서 사용 중인 오픈소스 패키지와 버전을 자동으로 추출합니다.",
  },
  {
    icon: ShieldAlert,
    title: "CVE 취약점 스캔",
    desc: "추출된 구성요소를 알려진 취약점(CVE)과 대조하고 CRITICAL부터 NEGLIGIBLE까지 심각도를 분류합니다.",
  },
  {
    icon: Scale,
    title: "배포 정책 판정",
    desc: "분석 결과를 바탕으로 PASS · REVIEW · BLOCK 중 하나로 판정해 배포 가능 여부를 바로 알려줍니다.",
  },
  {
    icon: Wrench,
    title: "자동 수정 ZIP",
    desc: "수정 버전이 있는 npm 패키지는 안전한 버전으로 올린 프로젝트를 ZIP으로 내려받을 수 있습니다.",
  },
  {
    icon: FileText,
    title: "PDF 보고서",
    desc: "심각도별 통계와 취약점 목록을 담은 분석 보고서를 PDF로 저장해 공유할 수 있습니다.",
  },
  {
    icon: LayoutDashboard,
    title: "대시보드 · 분석 히스토리",
    desc: "지금까지 분석한 파일의 위험도와 정책 판정 결과를 한 화면에서 모아 보고 다시 확인합니다.",
  },
];

export default function Features() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="features" style={{ ...introStyles.section, ...introStyles.sectionAlt }}>
      <div style={introStyles.inner}>
        <div style={introStyles.sectionHeader}>
          <span style={introStyles.eyebrow}>Features</span>
          <h2 style={introStyles.sectionTitle}>안전한 배포를 위한 핵심 기능</h2>
          <p style={introStyles.sectionDesc}>
            업로드 한 번으로 구성요소 파악부터 취약점 조치까지, 소프트웨어 공급망 점검에 필요한
            기능을 제공합니다.
          </p>
        </div>

        <div style={introStyles.cardGrid}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{ ...introStyles.card, ...(hovered === title ? introStyles.cardHover : {}) }}
              onMouseEnter={() => setHovered(title)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={introStyles.cardIcon}>
                <Icon size={24} />
              </div>
              <h3 style={introStyles.cardTitle}>{title}</h3>
              <p style={introStyles.cardDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
