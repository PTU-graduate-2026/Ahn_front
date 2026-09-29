import { AlertTriangle, Download, GitPullRequest, Wrench } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { FixPlanItem } from "../../services/_private/SbomApi";
import { scanResultStyles as styles } from "../../styles/scanResult";
import { GithubPrModal } from "./GithubPrModal";

type FixPlanPanelProps = {
  fileSeq: string | number;
  autoFixPlan: FixPlanItem[];
  manualFixPlan: FixPlanItem[];
  isDownloading: boolean;
  onDownload: () => void;
};

export function FixPlanPanel({
  fileSeq,
  autoFixPlan,
  manualFixPlan,
  isDownloading,
  onDownload,
}: FixPlanPanelProps) {
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const isDownloadDisabled = autoFixPlan.length === 0 || isDownloading;
  const isGithubPrDisabled = autoFixPlan.length === 0;

  return (
    <section style={{ ...styles.panel, marginBottom: 18 }}>
      <div style={styles.tableHeaderText}>
        <div>
          <h2 style={styles.sectionHeading}>자동 수정안</h2>
          <p style={styles.sectionDescription}>
            발견된 취약점 기준으로 수정 가능한 패키지와 수동 확인이 필요한 항목을
            분리했습니다.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={styles.countPill}>
            자동 {autoFixPlan.length}개 · 수동 {manualFixPlan.length}개
          </span>
          <button
            type="button"
            style={{
              ...styles.button,
              ...(isGithubPrDisabled ? styles.disabledButton : {}),
            }}
            disabled={isGithubPrDisabled}
            onClick={() => setIsGithubModalOpen(true)}
          >
            <GitPullRequest size={16} />
            GitHub PR로 자동 수정 올리기
          </button>
          <button
            type="button"
            style={{
              ...styles.primaryButton,
              ...(isDownloadDisabled ? styles.disabledButton : {}),
            }}
            disabled={isDownloadDisabled}
            onClick={onDownload}
          >
            <Download size={16} />
            {isDownloading ? "생성 중" : "수정된 ZIP 다운로드"}
          </button>
        </div>
      </div>
      {isGithubModalOpen && (
        <GithubPrModal fileSeq={fileSeq} onClose={() => setIsGithubModalOpen(false)} />
      )}
      <div style={styles.fixPlanGrid}>
        <FixPlanColumn
          title="자동 적용 가능"
          icon={<Wrench size={16} color="#2563eb" />}
          emptyText="자동 수정 가능한 항목이 없습니다."
          items={autoFixPlan}
          mode="auto"
        />
        <FixPlanColumn
          title="수동 확인 필요"
          icon={<AlertTriangle size={16} color="#f97316" />}
          emptyText="수동 확인이 필요한 항목이 없습니다."
          items={manualFixPlan}
          mode="manual"
        />
      </div>
    </section>
  );
}

type FixPlanColumnProps = {
  title: string;
  icon: ReactNode;
  emptyText: string;
  items: FixPlanItem[];
  mode: "auto" | "manual";
};

function FixPlanColumn({
  title,
  icon,
  emptyText,
  items,
  mode,
}: FixPlanColumnProps) {
  return (
    <div style={styles.fixPlanColumn}>
      <div style={styles.fixPlanColumnHeader}>
        <span>{title}</span>
        {icon}
      </div>
      {items.length === 0 ? (
        <div style={styles.planItem}>{emptyText}</div>
      ) : (
        items.slice(0, 5).map((item) => (
          <div
            key={`${mode}-${item.pkgName}-${item.currentVersion}-${item.targetVersion}-${item.vulnId}`}
            style={styles.planItem}
          >
            <strong>{item.pkgName}</strong>
            <div style={styles.planMeta}>
              <span style={styles.smallPill}>{item.pkgType || "unknown"}</span>
              {mode === "auto" ? (
                <span>
                  {item.currentVersion || "-"} -&gt;{" "}
                  {item.targetVersion || "확인 필요"}
                </span>
              ) : (
                <span>{item.vulnId || "취약점 확인 필요"}</span>
              )}
              <span>{item.targetFile || (mode === "auto" ? "대상 파일 확인" : "수동 확인")}</span>
            </div>
            <div style={{ ...styles.guideBox, ...styles.mono }}>{item.action}</div>
          </div>
        ))
      )}
    </div>
  );
}
