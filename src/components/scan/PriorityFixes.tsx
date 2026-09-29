import { AlertTriangle, ArrowRight } from "lucide-react";
import type { ScanResult } from "../../services/_private/SbomApi";
import { scanResultStyles as styles } from "../../styles/scanResult";
import { getFixGuide, severityColors } from "../../utils/scanResultUtils";

type PriorityFixesProps = {
  topFixes: ScanResult[];
};

export function PriorityFixes({ topFixes }: PriorityFixesProps) {
  return (
    <aside style={styles.panel}>
      <div style={{ ...styles.tableHeaderText, borderBottom: "1px solid #e2e8f0" }}>
        <div>
          <h2 style={styles.sectionHeading}>우선 조치</h2>
          <p style={styles.sectionDescription}>
            중복 패키지를 묶어 먼저 고쳐야 할 항목만 추렸습니다.
          </p>
        </div>
        <AlertTriangle size={18} color="#ea580c" />
      </div>
      {topFixes.length === 0 ? (
        <div style={{ ...styles.fixItem, color: "#64748b" }}>발견된 취약점이 없습니다.</div>
      ) : (
        topFixes.map((item, index) => {
          const color = severityColors[item.severity] ?? severityColors.Unknown;
          return (
            <div key={`${item.resultSeq}-${item.pkgName}`} style={styles.fixItem}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, width: 14 }}>
                  {index + 1}
                </span>
                <strong style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.pkgName}
                </strong>
                <span
                  style={{
                    ...styles.smallPill,
                    background: color.bg,
                    color: color.text,
                  }}
                >
                  {item.severity}
                </span>
              </div>
              {/* 현재 버전 → 권장 버전 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 8,
                  marginLeft: 22,
                  fontSize: 13,
                  ...styles.mono,
                }}
              >
                <span style={{ color: "#b91c1c" }}>{item.pkgVersion}</span>
                <ArrowRight size={14} color="#94a3b8" />
                <span style={{ color: item.fixedVer ? "#15803d" : "#94a3b8" }}>
                  {item.fixedVer ? `${item.fixedVer} 이상` : "수정 버전 확인 필요"}
                </span>
                {item.pkgType && <span style={{ ...styles.packageType, marginLeft: "auto" }}>{item.pkgType}</span>}
              </div>
              <div style={{ ...styles.guideBox, ...styles.mono, marginLeft: 22 }}>
                {getFixGuide(item)}
              </div>
            </div>
          );
        })
      )}
    </aside>
  );
}
