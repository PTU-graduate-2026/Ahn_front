import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { introColors, introStyles } from "../../styles/introduce";

// 자주 묻는 질문 — 항목 추가/수정은 여기만 고치면 됨
const faqs = [
  {
    q: "SBOM이 무엇인가요?",
    a: "SBOM(Software Bill of Materials)은 소프트웨어를 구성하는 오픈소스 패키지와 버전을 정리한 목록입니다. 어떤 구성요소가 들어 있는지 알아야 그 안의 취약점도 찾을 수 있습니다.",
  },
  {
    q: "어떤 파일을 업로드할 수 있나요?",
    a: "SPDX(.spdx, .json), CycloneDX(.cdx, .xml), YAML(.yaml, .yml) 형식의 SBOM 파일과 프로젝트 압축 파일(.zip)을 업로드할 수 있습니다. ZIP을 올리면 구성요소를 자동으로 추출합니다.",
  },
  {
    q: "GitHub 저장소를 바로 분석할 수 있나요?",
    a: "업로드 화면의 GitHub 탭에서 Personal Access Token을 입력하고 저장소를 고르면, 기본 브랜치의 최신 커밋을 가져와 분석합니다. 자동 수정 PR을 머지한 뒤 '다시 분석'하면 수정 전·후 취약점 수를 비교해 볼 수 있습니다.",
  },
  {
    q: "GitHub 토큰은 저장되나요?",
    a: "저장되지 않습니다. 토큰은 브라우저 탭의 메모리에만 잠시 보관되고 요청할 때만 서버로 전달되며, 새로고침하거나 로그아웃하면 사라집니다.",
  },
  {
    q: "정책 판정(PASS · REVIEW · BLOCK)은 무엇인가요?",
    a: "분석 결과를 바탕으로 배포 가능 여부를 판정합니다. PASS는 배포 가능, REVIEW는 검토 후 배포, BLOCK은 조치 전 배포를 막아야 하는 상태를 의미합니다.",
  },
  {
    q: "자동 수정 ZIP은 어떤 경우에 받을 수 있나요?",
    a: "ZIP 파일로 업로드했고, 수정 버전이 존재하는 npm 패키지가 있을 때 해당 패키지를 안전한 버전으로 올린 프로젝트를 ZIP으로 내려받을 수 있습니다.",
  },
  {
    q: "로그인이 필요한가요?",
    a: "네. 파일 업로드와 분석 결과 · 히스토리 · 대시보드는 로그인 후 이용할 수 있습니다. 분석 기록은 회원별로 따로 저장되고, 결과는 언제든 PDF 보고서로 내려받을 수 있습니다.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section style={{ ...introStyles.section, ...introStyles.sectionAlt }}>
      <div style={introStyles.inner}>
        <div style={introStyles.sectionHeader}>
          <span style={introStyles.eyebrow}>FAQ</span>
          <h2 style={introStyles.sectionTitle}>자주 묻는 질문</h2>
        </div>

        <div style={introStyles.faqList}>
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} style={introStyles.faqItem}>
                <button
                  type="button"
                  style={introStyles.faqQuestion}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  {item.q}
                  <ChevronDown
                    size={20}
                    color={introColors.muted}
                    style={{
                      flexShrink: 0,
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}
                  />
                </button>
                {isOpen && <p style={introStyles.faqAnswer}>{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
