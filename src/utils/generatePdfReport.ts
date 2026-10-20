import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ScanResult, SbomComponent } from "../services/_private/SbomApi";

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NEGLIGIBLE", "UNKNOWN"];

const NANUM_FONT_URL =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf";

async function loadKoreanFont(doc: jsPDF): Promise<void> {
  const res = await fetch(NANUM_FONT_URL);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  doc.addFileToVFS("NanumGothic.ttf", base64);
  doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
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

export const generatePdfReport = async (
  fileSeq: string | undefined,
  results: ScanResult[],
  components: SbomComponent[],
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
  doc.setFont("NanumGothic");
  doc.text("Zero Check SBOM 분석 보고서", 14, 13);

  doc.setFontSize(9);
  doc.text(`파일 번호: ${fileSeq ?? "-"}   |   생성일시: ${now}`, 14, 22);

  // ── Summary Cards ─────────────────────────────────────────
  let y = 38;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("NanumGothic");
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
    doc.setFont("helvetica", "bold");
    doc.text(String(counts[sev] ?? 0), x + cardW / 2, y + 8, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(sev, x + cardW / 2, y + 14, { align: "center" });
  });

  y += 24;

  // Total / Components
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("NanumGothic");
  doc.text(
    `전체 취약점: ${results.length}건   |   전체 구성요소: ${components.length}개`,
    14,
    y,
  );
  y += 10;

  // ── Vulnerability Table ───────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("NanumGothic");
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
  doc.setFont("NanumGothic");
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
    margin: { left: 14, right: 14 },
  });

  // ── Footer ────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `SafeLink 보안 분석 보고서  |  ${i} / ${pageCount} 페이지`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" },
    );
  }

  doc.save(`safelink-report-${fileSeq ?? "unknown"}.pdf`);
};
