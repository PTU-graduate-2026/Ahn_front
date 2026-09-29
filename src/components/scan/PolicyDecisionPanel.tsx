import { Ban, CheckCircle2, CircleCheck, CircleX, ShieldQuestion } from "lucide-react";
import { scanResultStyles as styles } from "../../styles/scanResult";
import type { PolicyResult } from "../../services/_private/SbomApi";

type PolicyDecisionPanelProps = {
  policyResult: PolicyResult | null;
};

const decisionTheme = {
  BLOCK: {
    color: "#dc2626",
    bg: "#fff1f2",
    border: "#fecdd3",
    icon: Ban,
  },
  REVIEW: {
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    icon: ShieldQuestion,
  },
  PASS: {
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: CheckCircle2,
  },
};

export function PolicyDecisionPanel({ policyResult }: PolicyDecisionPanelProps) {
  if (!policyResult) return null;

  const theme =
    decisionTheme[policyResult.decision as keyof typeof decisionTheme] ??
    decisionTheme.REVIEW;
  const Icon = theme.icon;
  const violations = policyResult.violations ?? [];
  const passedRules = policyResult.passedRules ?? [];

  return (
    // 흰 바탕 + 왼쪽 색 띠 (판정 색은 아이콘·제목에만)
    <section
      style={{
        ...styles.policyPanel,
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${theme.color}`,
      }}
    >
      <div style={styles.policyHeader}>
        <div style={{ ...styles.policyIcon, color: theme.color, background: theme.bg }}>
          <Icon size={22} />
        </div>
        <div>
          <span style={styles.policyBadge}>정책 판정</span>
          <h2 style={{ ...styles.policyTitle, color: theme.color }}>
            {policyResult.decisionLabel}
          </h2>
          <p style={styles.policySummary}>{policyResult.summary}</p>
        </div>
      </div>

      <div style={styles.policyGrid}>
        <div style={styles.policyRuleBox}>
          <h3 style={styles.policyRuleTitle}>
            위반 또는 검토 항목
            <span style={{ ...styles.countPill, height: 22, background: violations.length ? "#fee2e2" : "#f1f5f9", color: violations.length ? "#991b1b" : "#64748b" }}>
              {violations.length}
            </span>
          </h3>
          {violations.length > 0 ? (
            violations.map((item) => (
              <div key={item.ruleCode} style={styles.policyRuleItem}>
                <CircleX size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: "#0f172a" }}>{item.title}</strong>
                  <div style={{ marginTop: 2, color: "#64748b" }}>{item.message}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={styles.policyEmptyText}>정책 위반 항목이 없습니다.</p>
          )}
        </div>

        <div style={styles.policyRuleBox}>
          <h3 style={styles.policyRuleTitle}>
            통과한 정책
            <span style={{ ...styles.countPill, height: 22, background: "#dcfce7", color: "#166534" }}>
              {passedRules.length}
            </span>
          </h3>
          {passedRules.length > 0 ? (
            passedRules.slice(0, 4).map((item) => (
              <div key={item.ruleCode} style={styles.policyRuleItem}>
                <CircleCheck size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: "#0f172a" }}>{item.title}</strong>
                  <div style={{ marginTop: 2, color: "#64748b" }}>{item.message}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={styles.policyEmptyText}>통과한 정책이 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
}
