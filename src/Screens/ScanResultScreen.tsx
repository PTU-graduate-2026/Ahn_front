import { useMemo, useState } from "react";
import {
  ArrowLeft,
  LayoutDashboard,
  RotateCcw,
  FileDown,
  Mail,
  Wrench,
} from "lucide-react";
import Topbar from "./IntroduceScreen/Topbar";
import { buildPdfReport, generatePdfReport } from "../utils/generatePdfReport";
import { sendReportMail } from "../services/_private/SbomApi";
import { getErrorMessage } from "../services/_private/ApiConfig";
import { getCurrentUserName } from "../utils/currentUser";
import { useNavigate, useParams } from "react-router-dom";
import { ComponentTable } from "../components/scan/ComponentTable";
import { CriticalAlertBanner } from "../components/scan/CriticalAlertBanner";
import { FixPlanPanel } from "../components/scan/FixPlanPanel";
import { GithubSourceBar } from "../components/scan/GithubSourceBar";
import { LoadingState } from "../components/scan/LoadingState";
import { PolicyDecisionPanel } from "../components/scan/PolicyDecisionPanel";
import { PriorityFixes } from "../components/scan/PriorityFixes";
import { RiskOverview } from "../components/scan/RiskOverview";
import { ScanSummaryCards } from "../components/scan/ScanSummaryCards";
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
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [showFixPlan, setShowFixPlan] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePdfReport(fileSeq, results, components, getCurrentUserName());
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 내려받기와 같은 PDF를 만들어 첨부 → 서버가 로그인한 본인 이메일로 보냄
  const handleSendMail = async () => {
    if (!fileSeq) return;
    setIsSendingMail(true);
    try {
      const doc = await buildPdfReport(fileSeq, results, components, getCurrentUserName());
      const response = await sendReportMail(fileSeq, doc.output("blob"));
      alert(response.message);
    } catch (err) {
      alert(await getErrorMessage(err, "메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setIsSendingMail(false);
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
  const topFixes = useMemo(() => getTopFixes(sortedResults), [sortedResults]);
  const vulnerableComponentKeys = useMemo(
    () => getVulnerableComponentKeys(results),
    [results],
  );
  const vulnerableComponentCount = useMemo(
    () => getVulnerableComponentCount(components, vulnerableComponentKeys),
    [components, vulnerableComponentKeys],
  );
  const riskStatus = useMemo(
    () => getRiskStatus(counts, results.length, components.length),
    [counts, results.length, components.length],
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
        <button
          type="button"
          style={styles.backLink}
          onClick={() => navigate("/history")}
        >
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
              style={styles.button}
              onClick={handleSendMail}
              disabled={isSendingMail || loading}
            >
              <Mail size={16} />
              {isSendingMail ? "보내는 중..." : "메일로 보내기"}
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
              <RotateCcw size={16} />새 파일 분석
            </button>
          </div>
        </header>

        {error ? (
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>{error}</h2>
          </section>
        ) : (
          <>
            <GithubSourceBar fileSeq={fileSeq ?? ""} />

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
              results={results}
              componentCount={components.length}
              vulnerableComponentCount={vulnerableComponentCount}
              findingCount={results.length}
            />

            <ComponentTable
              components={components}
              vulnerableComponentKeys={vulnerableComponentKeys}
              results={results}
            />

            {showFixPlan && (
              <section
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <FixPlanPanel
                  fileSeq={fileSeq ?? ""}
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
