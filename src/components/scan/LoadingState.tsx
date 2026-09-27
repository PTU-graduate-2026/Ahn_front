import { Loader } from "lucide-react";
import Topbar from "../../Screens/IntroduceScreen/Topbar";
import { scanResultStyles as styles } from "../../styles/scanResult";

export function LoadingState() {
  return (
    <main style={styles.page}>
      {/* 인라인 스타일로는 keyframes를 못 만들어서 <style>로 넣음 */}
      <style>{`@keyframes zcs-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .zcs-spin { animation: none !important; } }`}</style>
      <Topbar />
      <div style={{ ...styles.content, display: "flex", justifyContent: "center", paddingTop: 96 }}>
        <section style={{ ...styles.panel, padding: "32px 36px", display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              ...styles.riskIconBase,
              background: "rgba(31, 78, 140, 0.08)",
              color: "#1f4e8c",
            }}
          >
            <Loader size={24} className="zcs-spin" style={{ animation: "zcs-spin 1.2s linear infinite" }} />
          </div>
          <div>
            <h1 style={{ ...styles.riskTitleBase, fontSize: 18 }}>분석 결과를 불러오는 중입니다</h1>
            <p style={styles.riskText}>
              업로드된 파일의 구성요소와 취약점 정보를 정리하고 있습니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
