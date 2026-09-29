import { CheckCircle2, ShieldAlert } from "lucide-react";
import { scanResultStyles as styles } from "../../styles/scanResult";
import { chartInk, scanChartStyles as chartStyles } from "../../styles/scanCharts";

type RiskStatus = {
  label: string;
  title: string;
  description: string;
  bg: string;
  border: string;
  color: string;
};

type RiskOverviewProps = {
  riskStatus: RiskStatus;
  totalResults: number;
  vulnerableComponentCount: number;
  componentCount: number;
  safeComponentCount: number;
  vulnerableRatio: number;
};

// 심각도 차트와 같은 계열 (scanCharts.ts의 High/Medium 색), 0%면 초록
const getRatioColor = (vulnerableRatio: number) => {
  if (vulnerableRatio === 0) return "#16a34a";
  if (vulnerableRatio >= 50) return "#d63a2a";
  return "#ee6f30";
};

export function RiskOverview({
  riskStatus,
  totalResults,
  vulnerableComponentCount,
  componentCount,
  safeComponentCount,
  vulnerableRatio,
}: RiskOverviewProps) {
  return (
    <section style={styles.reportHero}>
      {/* 흰 바탕 + 왼쪽 색 띠, 아이콘·라벨만 위험 색으로 */}
      <div
        style={{
          ...styles.riskCardBase,
          border: "1px solid #e2e8f0",
          borderLeft: `4px solid ${riskStatus.color}`,
        }}
      >
        <div style={{ ...styles.riskIconBase, color: riskStatus.color, background: riskStatus.bg }}>
          {totalResults > 0 ? <ShieldAlert size={24} /> : <CheckCircle2 size={24} />}
        </div>
        <div>
          <span style={{ ...styles.riskLabelBase, color: riskStatus.color, background: riskStatus.bg }}>
            {riskStatus.label}
          </span>
          <h2 style={{ ...styles.riskTitleBase, color: riskStatus.color }}>
            {riskStatus.title}
          </h2>
          <p style={styles.riskText}>{riskStatus.description}</p>
        </div>
      </div>

      <aside style={styles.insightPanel}>
        <h2 style={styles.insightTitle}>구성요소 위험 비율</h2>
        <div style={chartStyles.ratioHead}>
          <span style={{ ...chartStyles.ratioValue, color: getRatioColor(vulnerableRatio) }}>
            {vulnerableRatio}%
          </span>
          <span style={chartStyles.ratioCaption}>의 구성요소에서 취약점 발견</span>
        </div>

        {/* 취약 | 안전 2칸 게이지 (조각 사이 2px 틈, 양 끝만 둥글게) */}
        <div
          style={chartStyles.meter}
          role="img"
          aria-label={`취약 구성요소 ${vulnerableComponentCount}개, 안전 또는 미탐지 ${safeComponentCount}개`}
        >
          {vulnerableComponentCount > 0 && (
            <div
              title={`취약 ${vulnerableComponentCount}개`}
              style={{
                flexGrow: vulnerableComponentCount,
                minWidth: 4,
                background: getRatioColor(vulnerableRatio),
                borderRadius: safeComponentCount > 0 ? "4px 0 0 4px" : 4,
              }}
            />
          )}
          {safeComponentCount > 0 && (
            <div
              title={`안전 또는 미탐지 ${safeComponentCount}개`}
              style={{
                flexGrow: safeComponentCount,
                minWidth: 4,
                background: chartInk.safe,
                borderRadius: vulnerableComponentCount > 0 ? "0 4px 4px 0" : 4,
              }}
            />
          )}
          {componentCount === 0 && (
            <div style={{ flexGrow: 1, background: chartInk.track, borderRadius: 4 }} />
          )}
        </div>

        <div style={styles.insightLine}>
          <span style={chartStyles.legendItem}>
            <span style={{ ...chartStyles.legendDot, background: getRatioColor(vulnerableRatio) }} />
            취약 구성요소
          </span>
          <strong>
            {vulnerableComponentCount}개 / {componentCount}개
          </strong>
        </div>
        <div style={styles.insightLine}>
          <span style={chartStyles.legendItem}>
            <span style={{ ...chartStyles.legendDot, background: chartInk.safe }} />
            안전 또는 미탐지 구성요소
          </span>
          <strong>{safeComponentCount}개</strong>
        </div>
        <div style={styles.insightLine}>
          <span>전체 취약점 발견 건수</span>
          <strong>{totalResults}건</strong>
        </div>
      </aside>
    </section>
  );
}
