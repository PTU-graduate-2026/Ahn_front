import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

// 핵심 기능 — 이용 단계 앞에서 무엇을 해 주는 서비스인지 그림으로 먼저 보여 줌
const highlights: { title: string; desc: string; art: ReactNode }[] = [
  {
    title: "구성요소 추출",
    desc: "SBOM 파일, 프로젝트 ZIP, GitHub 저장소에서 오픈소스 패키지와 버전을 목록으로 뽑아냅니다.",
    art: <ExtractArt />,
  },
  {
    title: "취약점 스캔",
    desc: "뽑아낸 패키지를 알려진 취약점(CVE)과 비교해 CRITICAL부터 NEGLIGIBLE까지 심각도를 매깁니다.",
    art: <ScanArt />,
  },
  {
    title: "배포 판정",
    desc: "발견된 취약점의 심각도를 기준으로 PASS, REVIEW, BLOCK 중 하나로 배포 가능 여부를 알려 줍니다.",
    art: <VerdictArt />,
  },
  {
    title: "자동 수정 · 보고서",
    desc: "수정 버전이 있는 npm 패키지는 버전을 올린 ZIP이나 GitHub PR로 받고, 결과는 PDF 보고서로 남깁니다.",
    art: <FixArt />,
  },
];

// 그림 조각의 등장 순서 — CSS에서 카드 등장 뒤 --k × 70ms 만큼 늦게 나타남
const k = (n: number) => ({ "--k": n }) as CSSProperties;

export default function Highlights() {
  const gridRef = useRef<HTMLUListElement>(null);

  // 카드 묶음이 화면에 들어오면 카드가 차례로 떠오르고, 카드 안 그림이 조각조각 그려짐 (한 번만)
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".intro-hl__card"));
    const showAll = () => cards.forEach((card) => (card.dataset.shown = ""));

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return;
    }

    grid.dataset.reveal = "on";
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 화면 아래 20% 안쪽으로 들어왔거나, 이미 위로 지나쳐 간 경우
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        showAll();
        observer.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="highlights" className="intro-hl">
      <div className="intro-inner">
        <div className="intro-head">
          <h2>핵심 기능</h2>
          <p>파일 하나를 올리면 이 네 가지가 차례로 이루어집니다.</p>
        </div>

        <ul ref={gridRef} className="intro-hl__grid">
          {highlights.map((item, i) => (
            <li key={item.title} className="intro-hl__card" style={{ "--i": i } as CSSProperties}>
              <div className="intro-hl__art" aria-hidden="true">
                {item.art}
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── 그림 (색은 introduce.css의 ill-* 클래스가 토큰으로 칠함) ──
// 움직임 클래스: ill-in(아래에서 떠오름) · ill-from-left / ill-from-right(옆에서 밀려옴) · ill-pop(커지며 나타남) · ill-draw(선이 그려짐)

// 패키지 한 줄: 아이콘 칸 + 이름/버전 막대
function PackageRow({ x, y, w, nameW, order }: { x: number; y: number; w: number; nameW: number; order: number }) {
  return (
    <g className="ill-from-left" style={k(order)}>
      <rect className="ill-surface ill-line" x={x} y={y} width={w} height={22} rx={6} />
      <rect className="ill-soft" x={x + 6} y={y + 5} width={12} height={12} rx={3} />
      <rect className="ill-ink" x={x + 24} y={y + 8} width={nameW} height={6} rx={3} />
      <rect className="ill-mute" x={x + 30 + nameW} y={y + 8} width={22} height={6} rx={3} />
    </g>
  );
}

// 1. 파일 → 패키지 목록
function ExtractArt() {
  return (
    <svg viewBox="0 0 280 150">
      <g className="ill-in" style={k(0)}>
        <path className="ill-surface ill-line" d="M34 22h50l18 18v88a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6Z" />
        <path className="ill-soft" d="M84 22v12a6 6 0 0 0 6 6h12Z" />
        <rect className="ill-accent" x={38} y={50} width={34} height={14} rx={4} />
        <text className="ill-on-accent" x={55} y={60.5} fontSize={9} fontWeight={700} textAnchor="middle">
          SBOM
        </text>
        <rect className="ill-mute" x={38} y={74} width={52} height={5} rx={2.5} />
        <rect className="ill-mute" x={38} y={86} width={44} height={5} rx={2.5} />
        <rect className="ill-mute" x={38} y={98} width={50} height={5} rx={2.5} />
        <rect className="ill-mute" x={38} y={110} width={36} height={5} rx={2.5} />
      </g>

      <path className="ill-accent-line ill-draw" style={k(1)} pathLength={1} d="M114 78h22m-7-7 7 7-7 7" />

      <PackageRow x={148} y={24} w={108} nameW={34} order={2} />
      <PackageRow x={148} y={52} w={108} nameW={26} order={3} />
      <PackageRow x={148} y={80} w={108} nameW={38} order={4} />
      <PackageRow x={148} y={108} w={108} nameW={22} order={5} />
    </svg>
  );
}

// 2. 패키지 목록 위로 돋보기가 지나가며 심각도 점이 붙음
function ScanArt() {
  const rows = [
    { y: 22, nameW: 34, sev: "ill-sev-critical" },
    { y: 50, nameW: 26, sev: "ill-sev-high" },
    { y: 78, nameW: 38, sev: "ill-sev-medium" },
    { y: 106, nameW: 22, sev: "ill-sev-low" },
  ];
  return (
    <svg viewBox="0 0 280 150">
      {rows.map((row, r) => (
        <g key={row.y}>
          <PackageRow x={40} y={row.y} w={150} nameW={row.nameW} order={r} />
          <circle className={`${row.sev} ill-pop`} style={k(r + 5)} cx={176} cy={row.y + 11} r={5} />
        </g>
      ))}
      <g className="intro-hl__lens">
        <g className="ill-sweep" style={k(2)}>
          <circle className="ill-glass ill-accent-line" cx={214} cy={58} r={26} />
          <path className="ill-accent-line ill-thick" d="M233 77l16 16" />
          <rect className="ill-block" x={198} y={51} width={32} height={14} rx={4} />
          <text className="ill-on-accent" x={214} y={61.5} fontSize={9} fontWeight={700} textAnchor="middle">
            CVE
          </text>
        </g>
      </g>
    </svg>
  );
}

// 3. 방패 + 판정 세 가지 (PASS가 켜진 상태)
function VerdictArt() {
  return (
    <svg viewBox="0 0 280 150">
      <path className="ill-accent ill-pop" style={k(0)} d="M76 20 112 33v32c0 26-16 45-36 53-20-8-36-27-36-53V33Z" />
      <path className="ill-on-accent-line ill-draw" style={k(2)} pathLength={1} d="M60 70l11 11 22-24" />

      <g className="ill-from-right" style={k(3)}>
        <rect className="ill-surface ill-line" x={140} y={64} width={104} height={24} rx={12} />
        <text className="ill-review-text" x={192} y={80} fontSize={10} fontWeight={700} textAnchor="middle">
          REVIEW
        </text>
      </g>
      <g className="ill-from-right" style={k(4)}>
        <rect className="ill-surface ill-line" x={140} y={96} width={104} height={24} rx={12} />
        <text className="ill-block-text" x={192} y={112} fontSize={10} fontWeight={700} textAnchor="middle">
          BLOCK
        </text>
      </g>
      <g className="ill-pop" style={k(6)}>
        <rect className="ill-pass" x={140} y={28} width={104} height={28} rx={14} />
        <text className="ill-on-accent" x={192} y={46} fontSize={11} fontWeight={700} textAnchor="middle">
          PASS
        </text>
      </g>
    </svg>
  );
}

// 4. 버전 올리기 → ZIP · PR · PDF
function FixArt() {
  return (
    <svg viewBox="0 0 280 150">
      <g className="ill-in" style={k(0)}>
        <rect className="ill-surface ill-line" x={28} y={22} width={96} height={34} rx={8} />
        <circle className="ill-sev-critical" cx={44} cy={39} r={5} />
        <text className="ill-ink-text" x={56} y={43} fontSize={11} fontWeight={700}>
          1.2.0
        </text>
      </g>
      <path className="ill-accent-line ill-draw" style={k(1)} pathLength={1} d="M132 39h18m-7-7 7 7-7 7" />
      <g className="ill-from-left" style={k(2)}>
        <rect className="ill-surface ill-pass-line" x={158} y={22} width={96} height={34} rx={8} />
        <circle className="ill-pass" cx={174} cy={39} r={5} />
        <text className="ill-ink-text" x={186} y={43} fontSize={11} fontWeight={700}>
          1.2.4
        </text>
      </g>

      <path className="ill-dash ill-in" style={k(3)} d="M139 62v14M74 76h130M74 76v12M139 76v12M204 76v12" />

      {[
        { x: 48, label: "ZIP" },
        { x: 113, label: "PR" },
        { x: 178, label: "PDF" },
      ].map((out, o) => (
        <g key={out.label} className="ill-in" style={k(4 + o)}>
          <path
            className="ill-soft"
            d={`M${out.x + 6} 92h34l12 12v28a6 6 0 0 1-6 6H${out.x + 6}a6 6 0 0 1-6-6v-34a6 6 0 0 1 6-6Z`}
          />
          <text className="ill-accent-text" x={out.x + 26} y={121} fontSize={11} fontWeight={700} textAnchor="middle">
            {out.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
