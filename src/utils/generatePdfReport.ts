import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ScanResult, SbomComponent } from "../services/_private/SbomApi";

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NEGLIGIBLE", "UNKNOWN"];

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
  doc.text(
    `전체 취약점: ${results.length}건   |   전체 구성요소: ${components.length}개`,
    14,
    y,
  );
  y += 10;

  // ── Vulnerability Table ───────────────────────────────────
  doc.setFontSize(11);
  doc.setFont(KOREAN_FONT, "normal");
  doc.setTextColor(30, 30, 30);
  doc.text("취약점 상세", 14, y);
  y += 4;

  const sorted = [...results].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf((a.severity ?? "UNKNOWN").toUpperCase()) -
      SEVERITY_ORDER.indexOf((b.severity ?? "UNKNOWN").toUpperCase()),
  );

  autoTable(doc, {
    startY: y,
    head: [["CVE ID", "패키지명", "버전", "심각도", "수정 버전"]],
    body: sorted.map((r) => [
      r.cveId ?? r.vulnId ?? "-",
      r.pkgName,
      r.pkgVersion,
      (r.severity ?? "UNKNOWN").toUpperCase(),
      r.fixedVer ?? "N/A",
    ]),
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 48 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 32 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const sev = String(data.cell.raw).toUpperCase();
        const [r, g, b] = severityColor(sev);
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = "bold";
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

  autoTable(doc, {
    startY: y2,
    head: [["패키지명", "버전", "타입", "라이선스"]],
    body: components.map((c) => [
      c.pkgName,
      c.pkgVersion ?? "-",
      c.pkgType ?? "-",
      c.license ?? "-",
    ]),
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
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
      `SafeLink 보안 분석 보고서  |  ${i} / ${pageCount} 페이지`,
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
