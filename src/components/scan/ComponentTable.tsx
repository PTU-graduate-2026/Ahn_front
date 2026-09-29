import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { SbomComponent } from "../../services/_private/SbomApi";
import { scanResultStyles as styles } from "../../styles/scanResult";

type ComponentTableProps = {
  components: SbomComponent[];
  vulnerableComponentKeys: Set<string>;
};

export function ComponentTable({
  components,
  vulnerableComponentKeys,
}: ComponentTableProps) {
  const [query, setQuery] = useState("");
  const [onlyVulnerable, setOnlyVulnerable] = useState(false);

  const isVulnerable = (item: SbomComponent) =>
    vulnerableComponentKeys.has(`${item.pkgName}@${item.pkgVersion ?? ""}`);

  // 취약한 구성요소를 위로, 검색어·필터 적용
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return components
      .filter((item) => !onlyVulnerable || isVulnerable(item))
      .filter((item) => !keyword || item.pkgName?.toLowerCase().includes(keyword))
      .sort((a, b) => Number(isVulnerable(b)) - Number(isVulnerable(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, vulnerableComponentKeys, query, onlyVulnerable]);

  const vulnerableCount = components.filter(isVulnerable).length;

  return (
    <section style={{ ...styles.panel, marginBottom: 18 }}>
      <div style={styles.tableHeaderText}>
        <div>
          <h2 style={styles.sectionHeading}>구성요소 목록</h2>
          <p style={styles.sectionDescription}>
            SBOM에서 식별된 전체 구성요소입니다. 취약점이 연결된 항목이 위에 표시됩니다.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              color="#94a3b8"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="패키지 검색"
              aria-label="패키지 검색"
              style={{
                height: 34,
                width: 200,
                padding: "0 10px 0 32px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 34,
              padding: "0 10px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={onlyVulnerable}
              onChange={(e) => setOnlyVulnerable(e.target.checked)}
            />
            취약한 것만 ({vulnerableCount})
          </label>
          <span style={styles.countPill}>총 {components.length}개</span>
        </div>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: 90 }}>상태</th>
              <th style={styles.th}>패키지</th>
              <th style={styles.th}>버전</th>
              <th style={styles.th}>타입</th>
              <th style={styles.th}>라이선스</th>
            </tr>
          </thead>
          <tbody>
            {components.length === 0 ? (
              <tr>
                <td style={{ ...styles.td, color: "#64748b", textAlign: "center", padding: 32 }} colSpan={5}>
                  저장된 구성요소가 없습니다. ZIP 파일을 다시 업로드하거나, SBOM
                  파일에 components 항목이 있는지 확인하세요.
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td style={{ ...styles.td, color: "#64748b", textAlign: "center", padding: 32 }} colSpan={5}>
                  조건에 맞는 구성요소가 없습니다.
                </td>
              </tr>
            ) : (
              visible.map((item) => {
                const vulnerable = isVulnerable(item);

                return (
                  <tr key={item.componentSeq}>
                    <td style={styles.td}>
                      {/* 색 점 + 글자 (색만으로 구분하지 않게) */}
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          color: vulnerable ? "#b91c1c" : "#15803d",
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: vulnerable ? "#dc2626" : "#16a34a",
                          }}
                        />
                        {vulnerable ? "취약" : "안전"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.componentName}>
                        <strong title={item.pkgName}>{item.pkgName}</strong>
                      </div>
                    </td>
                    <td style={{ ...styles.td, ...styles.mono, color: "#475569" }}>
                      {item.pkgVersion || "-"}
                    </td>
                    <td style={styles.td}>
                      {item.pkgType ? <span style={styles.smallPill}>{item.pkgType}</span> : "-"}
                    </td>
                    <td style={{ ...styles.td, ...styles.mono, color: item.license ? "#475569" : "#94a3b8" }}>
                      {item.license || "확인 필요"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
