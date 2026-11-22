import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ScanResult, SbomComponent } from "../services/_private/SbomApi";
import {
  buildComponentRiskMap,
  cvssSeverity,
  formatEpss,
  isKnownExploited,
  sortBySeverity,
} from "./scanResultUtils";

const RED: [number, number, number] = [185, 28, 28];
const MUTED: [number, number, number] = [148, 163, 184];

// 외부 CDN은 403 등으로 실패할 수 있어 public/fonts에 폰트를 번들해서 사용
const KOREAN_FONT = "NanumGothic";
const FONT_FILES = [
  { file: "NanumGothic-Regular.ttf", style: "normal" },
  { file: "NanumGothic-Bold.ttf", style: "bold" },
];

const fontCache = new Map<string, string>();

async function fetchFontBase64(file: string): Promise<string> {
  const cached = fontCache.get(file);
  if (cached) return cached;

  const res = await fetch(`${import.meta.env.BASE_URL}fonts/${file}`);
  if (!res.ok) throw new Error(`폰트 로드 실패: ${file} (${res.status})`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const base64 = btoa(binary);
  fontCache.set(file, base64);
  return base64;
}

async function loadKoreanFont(doc: jsPDF): Promise<void> {
  for (const { file, style } of FONT_FILES) {
    doc.addFileToVFS(file, await fetchFontBase64(file));
    doc.addFont(file, KOREAN_FONT, style);
  }
}

const severityColor = (severity: string): [number, number, number] => {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return [220, 38, 38];
    case "HIGH":     return [234, 88, 12];
    case "MEDIUM":   return [202, 138, 4];
    case "LOW":      return [37, 99, 235];
    default:         return [107, 114, 128];
  }
};

// PDF 문서를 만들어 돌려줌 — 내려받기(generatePdfReport)와 메일 첨부(ScanResultScreen)가 같이 씀
export const buildPdfReport = async (
  fileSeq: string | undefined,
  results: ScanResult[],
  components: SbomComponent[],
  userName?: string | null,
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  await loadKoreanFont(doc);

  const pageW = doc.internal.pageSize.getWidth();
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const now = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;

  // ── Header ───────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(KOREAN_FONT, "normal");
  doc.text("Zero Check SBOM 분석 보고서", 14, 13);

  doc.setFontSize(9);
  doc.text(
    `사용자: ${userName || "-"}   |   파일 번호: ${fileSeq ?? "-"}   |   생성일시: ${now}`,
    14,
    22,
  );

  // ── Summary Cards ─────────────────────────────────────────
  let y = 38;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont(KOREAN_FONT, "normal");
  doc.text("취약점 요약", 14, y);
  y += 6;

  const counts: Record<string, number> = {};
  for (const r of results) {
    const s = (r.severity ?? "UNKNOWN").toUpperCase();
    counts[s] = (counts[s] ?? 0) + 1;
  }

  const cardW = (pageW - 28 - 12) / 5;
  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NEGLIGIBLE"];
  severities.forEach((sev, i) => {
    const x = 14 + i * (cardW + 3);
    const [r, g, b] = severityColor(sev);
    doc.setFillColor(r, g, b);
    doc.roundedRect(x, y, cardW, 16, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(KOREAN_FONT, "bold");
    doc.text(String(counts[sev] ?? 0), x + cardW / 2, y + 8, { align: "center" });
    doc.setFontSize(7);
    doc.setFont(KOREAN_FONT, "normal");
    doc.text(sev, x + cardW / 2, y + 14, { align: "center" });
  });

  y += 24;

  // Total / Components
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont(KOREAN_FONT, "normal");
  const kevResults = sortBySeverity(results.filter(isKnownExploited));
  const criticalCvss = results.filter((r) => r.cvssScore != null && Number(r.cvssScore) >= 9).length;
  doc.text(
    `전체 취약점: ${results.length}건   |   전체 구성요소: ${components.length}개   |   ` +
      `실제 악용(KEV): ${kevResults.length}건   |   CVSS 9.0 이상: ${criticalCvss}건`,
    14,
    y,
  );
  y += 8;

  // ── 실제 악용 중인 취약점 (CISA KEV) ─────────────────────
  // 점수가 높은 것보다 "지금 실제로 공격에 쓰이는 것"이 가장 먼저 고칠 대상이라 따로 보여준다.
  if (kevResults.length > 0) {
    const shown = kevResults.slice(0, 5);
    const boxH = 9 + shown.length * 5 + (kevResults.length > shown.length ? 5 : 0);
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(252, 165, 165);
    doc.roundedRect(14, y, pageW - 28, boxH, 2, 2, "FD");
    doc.setTextColor(...RED);
    doc.setFontSize(9);
    doc.setFont(KOREAN_FONT, "bold");
    doc.text(`실제 공격에 악용 중인 취약점 ${kevResults.length}건 (CISA KEV) - 가장 먼저 조치하세요`, 18, y + 6);
    doc.setFont(KOREAN_FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    shown.forEach((r, i) => {
      const cvss = r.cvssScore != null ? `CVSS ${Number(r.cvssScore).toFixed(1)}` : "CVSS -";
      const fix = r.fixedVer ? `→ ${r.fixedVer} 이상` : "→ 수정 버전 확인 필요";
      // 한 줄로 그리므로 긴 패키지 이름은 잘라서 박스 밖으로 넘치지 않게
      const pkg = r.pkgName.length > 40 ? `${r.pkgName.slice(0, 39)}…` : r.pkgName;
      doc.text(`· ${r.cveId || r.vulnId || "-"}   ${pkg} ${r.pkgVersion}   ${cvss}   ${fix}`, 18, y + 11 + i * 5);
    });
    if (kevResults.length > shown.length) {
      doc.text(`  외 ${kevResults.length - shown.length}건은 아래 상세 표에서 확인`, 18, y + 11 + shown.length * 5);
    }
    y += boxH + 8;
  } else {
    y += 2;
  }

  // ── Vulnerability Table ───────────────────────────────────
  doc.setFontSize(11);
  doc.setFont(KOREAN_FONT, "normal");
  doc.setTextColor(30, 30, 30);
  doc.text("취약점 상세", 14, y);
  y += 4;

  // 결과 화면과 같은 순서: 심각도 → 실제 악용(KEV) → CVSS 높은 순
  const sorted = sortBySeverity(results);

  // 악용 칸: KEV면 "실제 악용", 아니면 EPSS(30일 내 악용 확률), 둘 다 없으면 "-"
  const exploitText = (r: ScanResult) =>
    isKnownExploited(r) ? "실제 악용" : r.epssScore != null ? `EPSS ${formatEpss(Number(r.epssScore))}` : "-";

  autoTable(doc, {
    startY: y,
    head: [["CVE ID", "패키지명", "버전", "심각도", "CVSS", "악용", "수정 버전"]],
    body: sorted.map((r) => [
      r.cveId || r.vulnId || "-",
      r.pkgName,
      r.pkgVersion,
      (r.severity ?? "UNKNOWN").toUpperCase(),
      r.cvssScore != null ? Number(r.cvssScore).toFixed(1) : "-",
      exploitText(r),
      r.fixedVer || "확인 필요",
    ]),
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    // A4 본문 폭 182mm. 버전 칸은 "8.2.7-1~deb12u1" 같은 Debian 버전이 한 줄에 들어가게 넉넉히
    columnStyles: {
      0: { cellWidth: 33 },
      1: { cellWidth: 40 },
      2: { cellWidth: 27 },
      3: { cellWidth: 19 },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 21, halign: "center" },
      6: { cellWidth: 30 },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      if (data.column.index === 3) {
        const [r, g, b] = severityColor(String(data.cell.raw).toUpperCase());
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.column.index === 4) {
        const score = Number(data.cell.raw);
        if (Number.isNaN(score)) {
          data.cell.styles.textColor = MUTED;
        } else {
          const [r, g, b] = severityColor(cvssSeverity(score).toUpperCase());
          data.cell.styles.textColor = [r, g, b];
          data.cell.styles.fontStyle = "bold";
        }
      }
      if (data.column.index === 5) {
        if (data.cell.raw === "실제 악용") {
          data.cell.styles.textColor = RED;
          data.cell.styles.fontStyle = "bold";
        } else if (data.cell.raw === "-") {
          data.cell.styles.textColor = MUTED;
        }
      }
      if (data.column.index === 6 && data.cell.raw === "확인 필요") {
        data.cell.styles.textColor = MUTED;
      }
    },
    styles: { font: KOREAN_FONT },
    margin: { left: 14, right: 14 },
  });

  // ── Component Table ───────────────────────────────────────
  const afterVuln = (doc as any).lastAutoTable?.finalY ?? 200;
  let y2 = afterVuln + 10;

  if (y2 > 260) {
    doc.addPage();
    y2 = 20;
  }

  doc.setFontSize(11);
  doc.setFont(KOREAN_FONT, "normal");
  doc.setTextColor(30, 30, 30);
  doc.text("구성요소 목록", 14, y2);
  y2 += 4;

  // 패키지별 최고 CVSS·실제 악용 여부 (결과 화면 구성요소 목록과 같은 계산), 취약한 것부터
  const riskMap = buildComponentRiskMap(results);
  const riskOf = (c: SbomComponent) => riskMap.get(`${c.pkgName}@${c.pkgVersion ?? ""}`);
  const sortedComponents = [...components].sort(
    (a, b) =>
      Number(Boolean(riskOf(b))) - Number(Boolean(riskOf(a))) ||
      Number(riskOf(b)?.kev ?? false) - Number(riskOf(a)?.kev ?? false) ||
      (riskOf(b)?.maxCvss ?? -1) - (riskOf(a)?.maxCvss ?? -1),
  );

  autoTable(doc, {
    startY: y2,
    head: [["패키지명", "버전", "타입", "라이선스", "취약점", "최고 CVSS", "실제 악용"]],
    body: sortedComponents.map((c) => {
      const risk = riskOf(c);
      return [
        c.pkgName,
        c.pkgVersion ?? "-",
        c.pkgType ?? "-",
        c.license || "-",
        risk ? `${risk.findingCount}건` : "-",
        risk?.maxCvss != null ? Number(risk.maxCvss).toFixed(1) : "-",
        risk?.kev ? "예" : "-",
      ];
    }),
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 52 },
      1: { cellWidth: 27 },
      2: { cellWidth: 20 },
      3: { cellWidth: 33 },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 17, halign: "center" },
      6: { cellWidth: 17, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      if (data.column.index === 5 && data.cell.raw !== "-") {
        const [r, g, b] = severityColor(cvssSeverity(Number(data.cell.raw)).toUpperCase());
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.column.index === 6 && data.cell.raw === "예") {
        data.cell.styles.textColor = RED;
        data.cell.styles.fontStyle = "bold";
      }
    },
    styles: { font: KOREAN_FONT },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont(KOREAN_FONT, "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Zero Check SBOM 분석 보고서  |  ${i} / ${pageCount} 페이지`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" },
    );
  }

  return doc;
};

export const generatePdfReport = async (
  fileSeq: string | undefined,
  results: ScanResult[],
  components: SbomComponent[],
  userName?: string | null,
) => {
  const doc = await buildPdfReport(fileSeq, results, components, userName);
  doc.save(`safelink-report-${fileSeq ?? "unknown"}.pdf`);
};
