import React from "react";

const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif";

export const middleStyles: Record<string, React.CSSProperties> = {
  // 히어로 전체 영역 (기존 육각형 배경 이미지 유지)
  container: {
    width: "100%",
    padding: "110px 24px 96px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    backgroundImage:
      "linear-gradient(180deg, rgba(5,10,20,0.02), rgba(5,10,20,0.04)), url('/middleback.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    fontFamily: font,
  },

  // 텍스트/버튼 묶음 (가운데 정렬)
  content: {
    maxWidth: "860px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "20px",
  },

  // 제목 위 작은 배지
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    borderRadius: "999px",
    backgroundColor: "#ffffff",
    border: "1px solid #dbe4f0",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
    fontSize: "13px",
    fontWeight: 600,
    color: "#1f4e8c",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#1f4e8c",
  },

  title: {
    fontSize: "64px",
    fontWeight: 800,
    color: "#1f4e8c",
    margin: 0,
    lineHeight: 1.05,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  headline: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    lineHeight: 1.4,
    color: "#1e293b",
    letterSpacing: "-0.5px",
  },

  subTitle: {
    fontSize: "17px",
    color: "#64748b",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "640px",
  },

  buttons: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px",
    marginTop: "8px",
  },

  // 수치 3개 (실제 서비스 기준 값만 사용)
  statRow: {
    width: "100%",
    marginTop: "40px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  stat: {
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  statDivider: {
    borderLeft: "1px solid #e2e8f0",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1f4e8c",
  },
  statLabel: {
    fontSize: "14px",
    color: "#64748b",
  },

  // 체크리스트 (2열)
  checkList: {
    listStyle: "none",
    margin: "8px 0 0",
    padding: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "10px 32px",
    textAlign: "left",
  },
  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    color: "#334155",
  },
  checkIcon: {
    color: "#1f4e8c",
    flexShrink: 0,
  },
};
