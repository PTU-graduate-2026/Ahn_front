import { AlertTriangle, ChevronDown, ChevronUp, Download, GitPullRequest, Wrench } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getFileStatus,
  type FileStatus,
  type FixPlanItem,
} from "../../services/_private/SbomApi";
import { scanResultStyles as styles } from "../../styles/scanResult";
import { GithubPrModal } from "./GithubPrModal";

type FixPlanPanelProps = {
  fileSeq: string | number;
  autoFixPlan: FixPlanItem[];
  manualFixPlan: FixPlanItem[];
  isDownloading: boolean;
  onDownload: () => void;
};

/** 같은 패키지(이름·타입·현재 버전)의 취약점들을 하나로 묶은 항목 */
type FixPlanGroup = {
  key: string;
  pkgName: string;
  pkgType?: string;
  currentVersion?: string;
  /** 묶인 취약점의 수정 버전 중 가장 높은 버전 (실제 수정 ZIP·PR에 적용되는 버전) */
  targetVersion?: string;
  targetFile?: string;
  severity?: string;
  action: string;
  items: FixPlanItem[];
};

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NEGLIGIBLE", "UNKNOWN"];

const SEVERITY_COLORS: Record<string, { background: string; color: string }> = {
  CRITICAL: { background: "#fee2e2", color: "#b91c1c" },
  HIGH: { background: "#ffedd5", color: "#c2410c" },
  MEDIUM: { background: "#fef9c3", color: "#a16207" },
  LOW: { background: "#dcfce7", color: "#15803d" },
};

function severityRank(severity?: string): number {
  const index = SEVERITY_ORDER.indexOf((severity || "UNKNOWN").toUpperCase());
  return index === -1 ? SEVERITY_ORDER.length : index;
}

/**
 * 버전 비교: 점(.)으로 나눈 숫자를 앞에서부터 비교한다 (백엔드 수정 로직과 같은 규칙).
 * 숫자가 같으면 접미사(-rc 등)가 없는 쪽을 더 높은 버전으로 본다.
 */
function compareVersions(a: string, b: string): number {
  const [aCore, aSuffix = ""] = a.split(/-(.*)/);
  const [bCore, bSuffix = ""] = b.split(/-(.*)/);
  const aParts = aCore.split(".");
  const bParts = bCore.split(".");
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i += 1) {
    const aNum = parseInt(aParts[i] ?? "0", 10) || 0;
    const bNum = parseInt(bParts[i] ?? "0", 10) || 0;
    if (aNum !== bNum) return aNum - bNum;
  }
  if (aSuffix === bSuffix) return 0;
  if (!aSuffix) return 1;
  if (!bSuffix) return -1;
  return aSuffix.localeCompare(bSuffix);
}

function groupFixPlan(items: FixPlanItem[], mode: "auto" | "manual"): FixPlanGroup[] {
  const groups = new Map<string, FixPlanGroup>();

  for (const item of items) {
    const key = `${item.pkgType || ""}|${item.pkgName}|${item.currentVersion || ""}`;
    const group = groups.get(key);

    if (!group) {
      groups.set(key, {
        key,
        pkgName: item.pkgName,
        pkgType: item.pkgType,
        currentVersion: item.currentVersion,
        targetVersion: item.targetVersion,
        targetFile: item.targetFile,
        severity: item.severity,
        action: item.action,
        items: [item],
      });
      continue;
    }

    group.items.push(item);
    if (
      item.targetVersion &&
      (!group.targetVersion || compareVersions(item.targetVersion, group.targetVersion) > 0)
    ) {
      group.targetVersion = item.targetVersion;
    }
    if (severityRank(item.severity) < severityRank(group.severity)) {
      group.severity = item.severity;
    }
    if (!group.targetFile && item.targetFile) {
      group.targetFile = item.targetFile;
    }
  }

  const result = Array.from(groups.values());
  for (const group of result) {
    group.items.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
    // 자동 수정은 최종 목표 버전 기준으로 안내 문구를 다시 만든다 (개별 CVE 문구는 펼쳐 보기에서 확인)
    if (mode === "auto" && group.targetVersion && group.items.length > 1) {
      const file = group.targetFile || "의존성 파일";
      group.action = `${file}에서 ${group.pkgName} 버전을 ${group.targetVersion} 이상으로 올리세요.`;
    }
  }

  // 심각도 높은 패키지 → 취약점 많은 패키지 순
  return result.sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) || b.items.length - a.items.length,
  );
}

export function FixPlanPanel({
  fileSeq,
  autoFixPlan,
  manualFixPlan,
  isDownloading,
  onDownload,
}: FixPlanPanelProps) {
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  // 수정된 ZIP은 프로젝트 ZIP(직접 업로드 / GitHub 저장소)으로 분석했을 때만 만들 수 있다.
  // SBOM·의존성 파일 하나만 올린 경우엔 고칠 프로젝트가 없어서 서버도 거절함.
  // 파일 정보를 아직 못 가져왔으면(null) 막지 않는다 → 서버가 최종 판단.
  const [isProjectZip, setIsProjectZip] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    setIsProjectZip(null);
    if (fileSeq === "") return;
    getFileStatus(fileSeq)
      .then((data) => {
        const status = (data?.data as FileStatus | undefined) ?? undefined;
        if (cancelled || !status) return;
        const name = (status.fileName ?? "").toLowerCase();
        setIsProjectZip(status.sourceType === "GITHUB" || name.endsWith(".zip"));
      })
      .catch(() => {
        // 못 가져오면 기존처럼 버튼을 열어둔다.
      });
    return () => {
      cancelled = true;
    };
  }, [fileSeq]);
  const isZipUnavailable = isProjectZip === false;
  const isDownloadDisabled = autoFixPlan.length === 0 || isDownloading || isZipUnavailable;
  const isGithubPrDisabled = autoFixPlan.length === 0;

  const autoGroups = useMemo(() => groupFixPlan(autoFixPlan, "auto"), [autoFixPlan]);
  const manualGroups = useMemo(() => groupFixPlan(manualFixPlan, "manual"), [manualFixPlan]);

  return (
    <section style={{ ...styles.panel, marginBottom: 18 }}>
      <div style={styles.tableHeaderText}>
        <div>
          <h2 style={styles.sectionHeading}>자동 수정안</h2>
          <p style={styles.sectionDescription}>
            발견된 취약점을 패키지별로 묶어, 한 번에 모두 해결되는 최종 수정 버전을
            보여줍니다.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={styles.countPill}>
            자동 {autoGroups.length}개 패키지 (취약점 {autoFixPlan.length}건) · 수동{" "}
            {manualGroups.length}개 패키지
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
            title={isZipUnavailable ? "프로젝트 ZIP으로 업로드했을 때만 사용할 수 있습니다." : undefined}
          >
            <Download size={16} />
            {isDownloading ? "생성 중" : "수정된 ZIP 다운로드"}
          </button>
        </div>
      </div>
      {isZipUnavailable && (
        <p style={{ ...styles.sectionDescription, margin: "0 0 14px" }}>
          수정된 ZIP 다운로드는 프로젝트를 ZIP으로 업로드했을 때 지원됩니다. 파일 하나만 올린 경우에는
          아래 수정안을 참고해 직접 버전을 올리거나, GitHub PR로 저장소에 바로 반영할 수 있습니다.
        </p>
      )}
      {isGithubModalOpen && (
        <GithubPrModal fileSeq={fileSeq} onClose={() => setIsGithubModalOpen(false)} />
      )}
      <div style={styles.fixPlanGrid}>
        <FixPlanColumn
          title="자동 적용 가능"
          icon={<Wrench size={16} color="#2563eb" />}
          emptyText="자동 수정 가능한 항목이 없습니다."
          groups={autoGroups}
          mode="auto"
        />
        <FixPlanColumn
          title="수동 확인 필요"
          icon={<AlertTriangle size={16} color="#f97316" />}
          emptyText="수동 확인이 필요한 항목이 없습니다."
          groups={manualGroups}
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
  groups: FixPlanGroup[];
  mode: "auto" | "manual";
};

const INITIAL_VISIBLE_GROUPS = 6;

function FixPlanColumn({ title, icon, emptyText, groups, mode }: FixPlanColumnProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleGroups = showAll ? groups : groups.slice(0, INITIAL_VISIBLE_GROUPS);
  const hiddenCount = groups.length - visibleGroups.length;

  return (
    <div style={styles.fixPlanColumn}>
      <div style={styles.fixPlanColumnHeader}>
        <span>{title}</span>
        {icon}
      </div>
      {groups.length === 0 ? (
        <div style={styles.planItem}>{emptyText}</div>
      ) : (
        <>
          {visibleGroups.map((group) => (
            <FixPlanGroupItem key={`${mode}-${group.key}`} group={group} mode={mode} />
          ))}
          {(hiddenCount > 0 || (showAll && groups.length > INITIAL_VISIBLE_GROUPS)) && (
            <button
              type="button"
              style={toggleButtonStyle}
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "접기" : `패키지 ${hiddenCount}개 더 보기`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function FixPlanGroupItem({ group, mode }: { group: FixPlanGroup; mode: "auto" | "manual" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const vulnCount = group.items.length;

  return (
    <div style={styles.planItem}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <strong>{group.pkgName}</strong>
        <SeverityBadge severity={group.severity} />
      </div>
      <div style={styles.planMeta}>
        <span style={styles.smallPill}>{group.pkgType || "unknown"}</span>
        {mode === "auto" ? (
          <span>
            {group.currentVersion || "-"} →{" "}
            <strong style={{ color: "#0f172a" }}>{group.targetVersion || "확인 필요"}</strong>
          </span>
        ) : (
          <span>{group.currentVersion || "-"}</span>
        )}
        <span>
          취약점 {vulnCount}건{mode === "auto" ? " 해결" : ""}
        </span>
        <span>{group.targetFile || (mode === "auto" ? "대상 파일 확인" : "수동 확인")}</span>
      </div>
      <div style={{ ...styles.guideBox, ...styles.mono }}>{group.action}</div>

      {vulnCount > 0 && (
        <button
          type="button"
          style={{ ...toggleButtonStyle, padding: "8px 0 0", borderTop: "none" }}
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? "취약점 목록 접기" : `취약점 ${vulnCount}건 보기`}
        </button>
      )}

      {isExpanded && (
        <ul style={vulnListStyle}>
          {group.items.map((item, index) => (
            <li key={`${item.vulnId || "unknown"}-${index}`} style={vulnRowStyle}>
              <SeverityBadge severity={item.severity} />
              <span style={styles.mono}>{item.vulnId || "ID 없음"}</span>
              <span style={{ color: "#64748b" }}>
                {mode === "auto"
                  ? `수정 버전 ${item.targetVersion || "-"}`
                  : item.action || "수동 확인 필요"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity?: string }) {
  if (!severity) return null;
  const key = severity.toUpperCase();
  const colors = SEVERITY_COLORS[key] ?? { background: "#f1f5f9", color: "#475569" };
  return (
    <span style={{ ...styles.smallPill, ...colors, fontWeight: 700 }}>
      {key.charAt(0) + key.slice(1).toLowerCase()}
    </span>
  );
}

const toggleButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  width: "100%",
  padding: "10px 14px",
  border: "none",
  borderTop: "1px solid #f1f5f9",
  background: "transparent",
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
} as const;

const vulnListStyle = {
  listStyle: "none",
  margin: "8px 0 0",
  padding: "8px 10px",
  borderRadius: 6,
  background: "#f8fafc",
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
} as const;

const vulnRowStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 8,
  fontSize: 12,
} as const;
