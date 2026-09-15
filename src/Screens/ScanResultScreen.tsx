import { useMemo, useState } from "react";
import { History, Home, RotateCcw, FileDown } from "lucide-react";
import { generatePdfReport } from "../utils/generatePdfReport";
import { useNavigate, useParams } from "react-router-dom";
import { ComponentTable } from "../components/scan/ComponentTable";
import { CriticalAlertBanner } from "../components/scan/CriticalAlertBanner";
import { FixPlanPanel } from "../components/scan/FixPlanPanel";
import { LoadingState } from "../components/scan/LoadingState";
import { PolicyDecisionPanel } from "../components/scan/PolicyDecisionPanel";
import { PriorityFixes } from "../components/scan/PriorityFixes";
import { RiskOverview } from "../components/scan/RiskOverview";
import { ScanSummaryCards } from "../components/scan/ScanSummaryCards";
import { VulnerabilityTable } from "../components/scan/VulnerabilityTable";
import { useScanResult } from "../hooks/useScanResult";
import { scanResultStyles as styles } from "../styles/scanResult";
import {
  countBySeverity,
  getCriticalCount,
  getRiskStatus,
  getTopFixes,
  getVulnerableComponentCount,
  getVulnerableComponentKeys,
  sortBySeverity,
  splitFixPlan,
} from "../utils/scanResultUtils";

export default function ScanResultScreen() {
  const { fileSeq } = useParams();
  const navigate = useNavigate();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePdfReport(fileSeq, results, components);
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  const {
    results,
    components,
    fixPlan,
    policyResult,
    isDownloading,
    loading,
    error,
    downloadFixedProjectZip,
  } = useScanResult(fileSeq);

  const sortedResults = useMemo(() => sortBySeverity(results), [results]);
  const counts = useMemo(() => countBySeverity(results), [results]);
  const criticalCount = useMemo(() => getCriticalCount(counts), [counts]);
  const topFixes = useMemo(
    () => getTopFixes(sortedResults),
    [sortedResults],
  );
  const vulnerableComponentKeys = useMemo(
    () => getVulnerableComponentKeys(results),
    [results],
  );
  const vulnerableComponentCount = useMemo(
    () => getVulnerableComponentCount(components, vulnerableComponentKeys),
    [components, vulnerableComponentKeys],
  );
  const riskStatus = useMemo(
    () => getRiskStatus(counts, results.length),
    [counts, results.length],
  );
  const { autoFixPlan, manualFixPlan } = useMemo(
    () => splitFixPlan(fixPlan),
    [fixPlan],
  );

  const safeComponentCount = Math.max(
    components.length - vulnerableComponentCount,
    0,
  );
  const vulnerableRatio =
    components.length === 0
      ? 0
      : Math.round((vulnerableComponentCount / components.length) * 100);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>SBOM 분석 결과</h1>
          <p style={styles.subtitle}>
            파일 번호 {fileSeq} 기준의 구성요소, 취약점, 권장 수정 버전입니다.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.button}
            onClick={() => navigate("/dashboard")}
          >
            <Home size={16} />
            홈
          </button>
          <button
            type="button"
            style={styles.button}
            onClick={() => navigate("/history")}
          >
            <History size={16} />
            히스토리
          </button>
          <button
            type="button"
            style={styles.button}
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || loading}
          >
            <FileDown size={16} />
            {isGeneratingPdf ? "생성 중..." : "PDF 리포트"}
          </button>
          <button
            type="button"
            style={styles.primaryActionButton}
            onClick={() => navigate("/upload")}
          >
            <RotateCcw size={16} />
            새 파일 분석
          </button>
        </div>
      </header>

      {error ? (
        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>{error}</h2>
        </section>
      ) : (
        <>
          <CriticalAlertBanner criticalCount={criticalCount} />

          <RiskOverview
            riskStatus={riskStatus}
            totalResults={results.length}
            vulnerableComponentCount={vulnerableComponentCount}
            componentCount={components.length}
            safeComponentCount={safeComponentCount}
            vulnerableRatio={vulnerableRatio}
          />

          <PolicyDecisionPanel policyResult={policyResult} />

          <ScanSummaryCards
            counts={counts}
            componentCount={components.length}
            vulnerableComponentCount={vulnerableComponentCount}
            findingCount={results.length}
          />

          <ComponentTable
            components={components}
            vulnerableComponentKeys={vulnerableComponentKeys}
          />

          <FixPlanPanel
            fileSeq={fileSeq ?? ""}
            autoFixPlan={autoFixPlan}
            manualFixPlan={manualFixPlan}
            isDownloading={isDownloading}
            onDownload={downloadFixedProjectZip}
          />

          <section style={styles.contentGrid}>
            <PriorityFixes topFixes={topFixes} />
            <VulnerabilityTable results={sortedResults} />
          </section>
        </>
      )}
    </main>
  );
}
