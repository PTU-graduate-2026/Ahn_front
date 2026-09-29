import React, { useState } from "react";
import { introStyles } from "../../styles/introduce";

// 이용 절차 — 실제 화면 흐름(업로드 → 분석 로딩 → 결과) 기준
const steps = [
  {
    title: "파일 업로드",
    desc: "SBOM(SPDX · CycloneDX) 파일이나 프로젝트 ZIP을 끌어다 놓아 업로드합니다. 여러 파일도 한 번에 올릴 수 있습니다.",
  },
  {
    title: "구성요소 추출 · 스캔",
    desc: "업로드한 파일에서 오픈소스 구성요소를 추출하고 알려진 취약점(CVE)을 자동으로 찾아냅니다.",
  },
  {
    title: "정책 판정",
    desc: "발견된 취약점의 심각도를 바탕으로 PASS · REVIEW · BLOCK 판정을 내려 배포 가능 여부를 알려줍니다.",
  },
  {
    title: "결과 확인 · 조치",
    desc: "결과 화면에서 취약점 목록과 수정 버전을 확인하고, 자동 수정 ZIP과 PDF 보고서를 내려받습니다.",
  },
];

export default function Process() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section style={introStyles.section}>
      <div style={introStyles.inner}>
        <div style={introStyles.sectionHeader}>
          <span style={introStyles.eyebrow}>How it works</span>
          <h2 style={introStyles.sectionTitle}>ZCS는 이렇게 작동합니다</h2>
          <p style={introStyles.sectionDesc}>
            복잡한 설정 없이 네 단계로 프로젝트의 오픈소스 보안 상태를 점검할 수 있습니다.
          </p>
        </div>

        <ol style={{ ...introStyles.stepGrid, listStyle: "none", margin: 0, padding: 0 }}>
          {steps.map((step, i) => {
            const isHovered = hovered === step.title;
            return (
              <li
                key={step.title}
                style={{ ...introStyles.step, ...(isHovered ? introStyles.stepHover : {}) }}
                onMouseEnter={() => setHovered(step.title)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  style={{
                    ...introStyles.stepNumber,
                    ...(isHovered ? introStyles.stepNumberHover : {}),
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 style={introStyles.stepTitle}>{step.title}</h3>
                <p style={introStyles.stepDesc}>{step.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
