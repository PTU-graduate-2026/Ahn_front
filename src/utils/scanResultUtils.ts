import type {
  FixPlanItem,
  SbomComponent,
  ScanResult,
} from "../services/_private/SbomApi";

export const severityOrder: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Negligible: 4,
  Unknown: 5,
};

export const severityColors: Record<string, { bg: string; text: string }> = {
  Critical: { bg: "#fee2e2", text: "#991b1b" },
  High: { bg: "#ffedd5", text: "#9a3412" },
  Medium: { bg: "#fef3c7", text: "#92400e" },
  Low: { bg: "#dcfce7", text: "#166534" },
  Negligible: { bg: "#e0f2fe", text: "#075985" },
  Unknown: { bg: "#e5e7eb", text: "#374151" },
};

const getSeverityCount = (counts: Record<string, number>, severity: string) =>
  counts[severity] ?? 0;

export const getRiskStatus = (
  counts: Record<string, number>,
  total: number,
) => {
  if (total === 0) {
    return {
      label: "양호",
      title: "발견된 취약점이 없습니다",
      description:
        "업로드된 구성요소 기준으로 알려진 취약점이 발견되지 않았습니다.",
      bg: "#ecfdf5",
      border: "#bbf7d0",
      color: "#166534",
    };
  }

  if (getSeverityCount(counts, "Critical") > 0) {
    return {
      label: "긴급 조치 필요",
      title: "Critical 취약점이 포함되어 있습니다",
      description:
        "배포 전 우선 조치 항목을 먼저 확인하고 핵심 패키지 버전을 올리는 것이 좋습니다.",
      bg: "#fef2f2",
      border: "#fecaca",
      color: "#991b1b",
    };
  }

  if (getSeverityCount(counts, "High") > 0) {
    return {
      label: "주의",
      title: "High 취약점이 포함되어 있습니다",
      description:
        "위험도가 높은 구성요소부터 수정 버전을 확인하고 업데이트 계획을 세워야 합니다.",
      bg: "#fff7ed",
      border: "#fed7aa",
      color: "#9a3412",
    };
  }

  return {
    label: "검토 필요",
    title: "중간 이하 위험 취약점이 발견되었습니다",
    description:
      "서비스 영향도를 확인한 뒤 수정 가능한 버전부터 순서대로 반영하세요.",
    bg: "#fffbeb",
    border: "#fde68a",
    color: "#92400e",
  };
};

export const getFixGuide = (item: ScanResult) => {
  if (!item.fixedVer) {
    return "공식 권고문에서 수정 가능 버전을 확인하세요.";
  }

  switch (item.pkgType) {
    case "npm":
      return `npm install ${item.pkgName}@${item.fixedVer}`;
    case "python":
      return `pip install ${item.pkgName}==${item.fixedVer}`;
    case "gem":
      return `bundle update ${item.pkgName}`;
    case "go-module":
      return `go get ${item.pkgName}@${item.fixedVer}`;
    case "java-archive":
    case "java":
      return `pom.xml 또는 build.gradle에서 ${item.pkgName} 버전을 ${item.fixedVer} 이상으로 올리세요.`;
    case "deb":
    case "rpm":
    case "apk":
      return `OS 패키지 매니저로 ${item.pkgName}을 ${item.fixedVer} 이상으로 업데이트하세요.`;
    default:
      return `${item.pkgName}을 ${item.fixedVer} 이상으로 업데이트하세요.`;
  }
};

export const sortBySeverity = (results: ScanResult[]) =>
  [...results].sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99),
  );

export const countBySeverity = (results: ScanResult[]) =>
  results.reduce<Record<string, number>>((acc, item) => {
    acc[item.severity] = (acc[item.severity] ?? 0) + 1;
    return acc;
  }, {});

// countBySeverity 결과에서 Critical 등급 건수만 뽑아낸다. (없으면 0)
export const getCriticalCount = (counts: Record<string, number>) =>
  counts["Critical"] ?? 0;

export const getTopFixes = (sortedResults: ScanResult[]) => {
  const map = new Map<string, ScanResult>();
  sortedResults.forEach((item) => {
    const key = `${item.pkgName}@${item.pkgVersion}`;
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values()).slice(0, 4);
};

export const getVulnerableComponentKeys = (results: ScanResult[]) =>
  new Set(results.map((item) => `${item.pkgName}@${item.pkgVersion}`));

export const getVulnerableComponentCount = (
  components: SbomComponent[],
  vulnerableComponentKeys: Set<string>,
) =>
  components.filter((item) =>
    vulnerableComponentKeys.has(`${item.pkgName}@${item.pkgVersion ?? ""}`),
  ).length;

export const splitFixPlan = (fixPlan: FixPlanItem[]) => ({
  autoFixPlan: fixPlan.filter((item) => item.autoApplicable),
  manualFixPlan: fixPlan.filter((item) => !item.autoApplicable),
});
