// 지원 범위 표 — 항목 추가/수정은 여기만 고치면 됨
const specs = [
  {
    name: "입력 형식",
    value: "SPDX (.spdx, .json), CycloneDX (.cdx, .xml), YAML (.yaml, .yml), 프로젝트 ZIP, GitHub 저장소",
  },
  { name: "취약점 분류", value: "CRITICAL, HIGH, MEDIUM, LOW, NEGLIGIBLE 5단계" },
  { name: "배포 정책 판정", value: "PASS, REVIEW, BLOCK" },
  {
    name: "자동 수정",
    value: "수정 버전이 있는 npm 패키지를 올린 프로젝트를 ZIP으로 받거나 GitHub PR로 올림",
  },
  { name: "PDF 보고서", value: "분석자, 생성일시, 심각도별 통계, 취약점 목록, 구성요소 목록" },
  {
    name: "기록",
    value: "분석 히스토리와 대시보드, GitHub 저장소는 다시 분석해 이전 결과와 비교",
  },
];

export default function Features() {
  return (
    <section id="features" className="intro-spec">
      <div className="intro-inner">
        <div className="intro-head">
          <h2>지원 범위</h2>
          <p>지금 분석하고 처리할 수 있는 항목입니다.</p>
        </div>

        <dl className="intro-spec__table">
          {specs.map((spec) => (
            <div key={spec.name} className="intro-spec__row">
              <dt>{spec.name}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
