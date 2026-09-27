import { useMemo, useState } from "react";
import { ArrowLeft, LayoutDashboard, RotateCcw, FileDown, Wrench } from "lucide-react";
import Topbar from "./IntroduceScreen/Topbar";
import { generatePdfReport } from "../utils/generatePdfReport";
import { useNavigate, useParams } from "react-router-dom";
import { ComponentTable } from "../components/scan/ComponentTable";
import { FixPlanPanel } from "../components/scan/FixPlanPanel";
import { LoadingState } from "../components/scan/LoadingState";
import { PolicyDecisionPanel } from "../components/scan/PolicyDecisionPanel";
import { PriorityFixes } from "../components/scan/PriorityFixes";
import { RiskOverview } from "../components/scan/RiskOverview";
import { ScanSummaryCards } from "../components/scan/ScanSummaryCards";
import { useScanResult } from "../hooks/useScanResult";
import { scanResultStyles as styles } from "../styles/scanResult";
import {
  countBySeverity,
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
  const [showFixPlan, setShowFixPlan] = useState(false);

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
      <Topbar />
      <div style={styles.content}>
      <button type="button" style={styles.backLink} onClick={() => navigate("/history")}>
        <ArrowLeft size={16} />
        분석 히스토리
      </button>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>SBOM 분석 결과</h1>
          <p style={styles.subtitle}>
            파일 #{fileSeq}의 구성요소, 취약점, 권장 수정 버전입니다.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.button}
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={16} />
            대시보드
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
            style={showFixPlan ? styles.primaryActionButton : styles.button}
            onClick={() => setShowFixPlan((prev) => !prev)}
          >
            <Wrench size={16} />
            자동 수정안
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
            results={results}
            componentCount={components.length}
            vulnerableComponentCount={vulnerableComponentCount}
            findingCount={results.length}
          />

          <ComponentTable
            components={components}
            vulnerableComponentKeys={vulnerableComponentKeys}
          />

          {showFixPlan && (
            <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <FixPlanPanel
                autoFixPlan={autoFixPlan}
                manualFixPlan={manualFixPlan}
                isDownloading={isDownloading}
                onDownload={downloadFixedProjectZip}
              />

              <PriorityFixes topFixes={topFixes} />
            </section>
          )}
        </>
      )}
      </div>
    </main>
  );
}
