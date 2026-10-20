import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

// 결과 칩 — tone이 있으면 앞에 색 점(심각도) 또는 판정 색을 붙임
type Chip = { label: string; tone?: string };

// 이용 단계 — 실제 화면 흐름(업로드 → 분석 → 판정 → 조치) 기준
const steps: { title: string; desc: string; outLabel: string; out: Chip[] }[] = [
  {
    title: "파일을 올리거나 저장소를 고릅니다",
    desc: "SBOM 파일이나 프로젝트 ZIP을 끌어다 놓거나, GitHub 탭에서 토큰을 입력하고 분석할 저장소를 선택합니다.",
    outLabel: "입력",
    out: [
      { label: "SPDX" },
      { label: "CycloneDX" },
      { label: "YAML" },
      { label: "프로젝트 ZIP" },
      { label: "GitHub 저장소" },
    ],
  },
  {
    title: "구성요소를 추출하고 취약점을 찾습니다",
    desc: "프로젝트에 들어 있는 오픈소스 패키지와 버전을 추출하고, 알려진 취약점(CVE)과 하나씩 비교합니다.",
    outLabel: "찾아내는 것",
    out: [
      { label: "패키지 목록" },
      { label: "CRITICAL", tone: "critical" },
      { label: "HIGH", tone: "high" },
      { label: "MEDIUM", tone: "medium" },
      { label: "LOW", tone: "low" },
      { label: "NEGLIGIBLE", tone: "negligible" },
    ],
  },
  {
    title: "배포해도 되는지 판정합니다",
    desc: "발견된 취약점의 심각도를 기준으로 PASS, REVIEW, BLOCK 중 하나로 판정합니다.",
    outLabel: "판정",
    out: [
      { label: "PASS", tone: "pass" },
      { label: "REVIEW", tone: "review" },
      { label: "BLOCK", tone: "block" },
    ],
  },
  {
    title: "고치고 다시 확인합니다",
    desc: "수정 버전이 있는 npm 패키지는 버전을 올린 ZIP을 받거나 GitHub에 PR로 올립니다. 저장소는 PR 반영 후 다시 분석해 이전 결과와 비교할 수 있습니다.",
    outLabel: "받는 것",
    out: [{ label: "수정 ZIP" }, { label: "GitHub PR" }, { label: "PDF 보고서" }],
  },
];

export default function Process() {
  const trackRef = useRef<HTMLDivElement>(null);

  // 스크롤해서 번호 배지가 화면 위 62% 지점에 닿으면 그 단계를 켬 → 앞 배지에서 화살표가 차오르고, 배지 · 카드가 차례로 나타남 (한 번 켠 단계는 유지)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.querySelectorAll<HTMLElement>(".intro-step"));
    const nums = items.map((item) => item.querySelector<HTMLElement>(".intro-step__num"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => (item.dataset.shown = ""));
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const tip = window.innerHeight * 0.62;
      items.forEach((item, i) => {
        const num = nums[i];
        if ("shown" in item.dataset || !num) return;
        const rect = num.getBoundingClientRect();
        if (rect.top + rect.height / 2 <= tip) item.dataset.shown = "";
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    track.dataset.reveal = "on";
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section id="stages" className="intro-stages">
      <div className="intro-inner">
        <div className="intro-head">
          <h2>업로드부터 수정까지 네 단계</h2>
          <p>각 단계가 끝나면 무엇을 받게 되는지 함께 정리했습니다.</p>
        </div>

        <div ref={trackRef} className="intro-track">
          <ol className="intro-steps">
            {steps.map((step, i) => (
              <li key={step.title} className="intro-step" style={{ "--i": i } as CSSProperties}>
                <span className="intro-step__num" aria-hidden="true">
                  <span className="intro-step__num-label">STEP</span>
                  <span className="intro-step__num-digit">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="intro-step__link" aria-hidden="true" />
                {i < steps.length - 1 && <span className="intro-step__seg" aria-hidden="true" />}
                <div className="intro-step__card">
                  <div className="intro-step__body">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                  <div className="intro-step__out">
                    <span className="intro-step__out-label">{step.outLabel}</span>
                    <ul>
                      {step.out.map((chip, c) => (
                        <li
                          key={chip.label}
                          className={`intro-chip${chip.tone ? ` intro-chip--${chip.tone}` : ""}`}
                          style={{ "--c": c } as CSSProperties}
                        >
                          {chip.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
