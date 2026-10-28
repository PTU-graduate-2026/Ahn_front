import { scanResultStyles as styles } from "../../styles/scanResult";
import { cvssSeverity, severityColors } from "../../utils/scanResultUtils";

type CvssBadgeProps = {
  score?: number | null;
  version?: string | null;
};

// CVSS 기본 점수 배지 (색은 점수 등급 기준, 숫자를 같이 써서 색만으로 구분하지 않음)
export function CvssBadge({ score, version }: CvssBadgeProps) {
  if (score == null) {
    return (
      <span style={{ fontSize: 12, color: "#94a3b8" }} title="이 취약점 데이터에 CVSS 점수가 없거나, 점수 저장 전 분석 기록입니다.">
        점수 없음
      </span>
    );
  }
  const color = severityColors[cvssSeverity(score)] ?? severityColors.Unknown;
  return (
    <span
      title={`CVSS${version ? ` v${version}` : ""} 기본 점수 ${score.toFixed(1)} / 10`}
      style={{
        ...styles.smallPill,
        background: color.bg,
        color: color.text,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      CVSS {score.toFixed(1)}
    </span>
  );
}

// CISA KEV(실제 공격에 악용 중) 등록 취약점 배지
export function KevBadge() {
  return (
    <span
      title="미국 CISA KEV 목록에 '실제 공격에 악용 중'으로 등록된 취약점입니다."
      style={{
        ...styles.smallPill,
        background: "#ffffff",
        color: "#b91c1c",
        border: "1px solid #fca5a5",
      }}
    >
      실제 악용
    </span>
  );
}
