import type { CSSProperties } from "react";
import { AlertTriangle } from "lucide-react";

type CriticalAlertBannerProps = {
  criticalCount: number;
};

const styles: Record<string, CSSProperties> = {
  banner: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "18px 22px",
    borderRadius: 12,
    border: "1px solid #fca5a5",
    background: "linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)",
    color: "#991b1b",
    marginBottom: 20,
    boxShadow: "0 12px 32px rgba(220, 38, 38, 0.14)",
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "#fee2e2",
    color: "#dc2626",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: -0.2,
  },
  desc: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "#b91c1c",
    lineHeight: 1.5,
  },
  countPill: {
    marginLeft: "auto",
    flexShrink: 0,
    padding: "8px 14px",
    borderRadius: 999,
    background: "#dc2626",
    color: "#fff",
    fontSize: 14,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
};

// Critical 등급 취약점이 1건 이상일 때만 노출되는 경고 배너.
export function CriticalAlertBanner({ criticalCount }: CriticalAlertBannerProps) {
  if (criticalCount <= 0) {
    return null;
  }

  return (
    <section role="alert" style={styles.banner}>
      <div style={styles.iconWrap}>
        <AlertTriangle size={24} />
      </div>
      <div style={styles.body}>
        <h2 style={styles.title}>치명적 취약점 {criticalCount}건 발견</h2>
        <p style={styles.desc}>
          Critical 등급 취약점이 포함되어 있습니다. 배포 전 반드시 해당 구성요소를
          우선 조치하세요.
        </p>
      </div>
      <span style={styles.countPill}>Critical {criticalCount}</span>
    </section>
  );
}
