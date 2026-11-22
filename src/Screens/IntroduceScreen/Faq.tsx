import { useState } from "react";
import { ChevronDown } from "lucide-react";

// 자주 묻는 질문 — 항목 추가/수정은 여기만 고치면 됨
const faqs = [
  {
    q: "SBOM이 무엇인가요?",
    a: "SBOM(Software Bill of Materials)은 소프트웨어를 구성하는 오픈소스 패키지와 버전을 정리한 목록입니다. 어떤 구성요소가 들어 있는지 알아야 그 안의 취약점도 찾을 수 있습니다.",
  },
  {
    q: "어떤 파일을 업로드할 수 있나요?",
    a: "세 가지 방식으로 올릴 수 있습니다. ① SBOM 파일: SPDX(.spdx, .json, .yaml), CycloneDX(.json, .xml, .cdx, .yaml, .yml) ② 의존성 파일 하나: package-lock.json, yarn.lock, pnpm-lock.yaml, requirements.txt, Pipfile.lock, poetry.lock, pom.xml, gradle.lockfile, go.mod, Cargo.lock, Gemfile.lock, composer.lock, .jar ③ 프로젝트 압축 파일(.zip). 의존성 파일과 ZIP은 서버가 SBOM을 자동으로 만들어 분석합니다. package.json이나 build.gradle은 버전 정보가 부족해 단독으로는 분석할 수 없으니 lock 파일이나 ZIP으로 올려주세요.",
  },
  {
    q: "GitHub 저장소를 바로 분석할 수 있나요?",
    a: "업로드 화면의 GitHub 탭에서 Personal Access Token을 입력하고 저장소를 고르면, 기본 브랜치의 최신 커밋을 가져와 분석합니다. 자동 수정 PR을 머지한 뒤 '다시 분석'하면 이전 분석과 취약점 수를 비교할 수 있습니다.",
  },
  {
    q: "GitHub 토큰은 저장되나요?",
    a: "저장되지 않습니다. 토큰은 브라우저 탭의 메모리에만 잠시 보관되고 요청할 때만 서버로 전달되며, 새로고침하거나 로그아웃하면 사라집니다.",
  },
  {
    q: "정책 판정(PASS, REVIEW, BLOCK)은 무엇인가요?",
    a: "분석 결과를 바탕으로 배포 가능 여부를 판정합니다. PASS는 배포 가능, REVIEW는 검토 후 배포, BLOCK은 조치 전 배포를 막아야 하는 상태를 의미합니다.",
  },
  {
    q: "자동 수정 ZIP은 어떤 경우에 받을 수 있나요?",
    a: "프로젝트를 ZIP 파일로 업로드했고, 수정 버전이 존재하는 npm 또는 Maven 패키지가 있을 때 해당 패키지를 안전한 버전으로 올린 프로젝트를 ZIP으로 내려받을 수 있습니다. SBOM이나 의존성 파일 하나만 올린 경우에는 수정안 목록과 GitHub PR을 이용해주세요.",
  },
  {
    q: "로그인이 필요한가요?",
    a: "네. 파일 업로드와 분석 결과, 히스토리, 대시보드는 로그인 후 이용할 수 있습니다. 분석 기록은 회원별로 따로 저장되고, 결과는 언제든 PDF 보고서로 내려받을 수 있습니다.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="intro-faq">
      <div className="intro-inner">
        <div className="intro-head">
          <h2>자주 묻는 질문</h2>
        </div>

        <div className="intro-faq__list">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="intro-faq__item">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    className="intro-faq__q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    {item.q}
                    <ChevronDown size={20} className="intro-faq__icon" aria-hidden="true" />
                  </button>
                </h3>
                <p
                  id={`faq-a-${i}`}
                  className="intro-faq__a"
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  hidden={!isOpen}
                >
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
