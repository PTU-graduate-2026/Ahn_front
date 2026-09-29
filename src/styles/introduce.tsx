import React from "react";

// 소개화면 공통 색상 — 기존 ZCS 파란색 계열 유지
export const introColors = {
  primary: "#1f4e8c", // 로고/제목 파란색
  primaryDark: "#173357", // 버튼/배너 어두운 파란색
  primarySoft: "rgba(31, 78, 140, 0.08)", // 아이콘 배경, 배지
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  sectionBg: "#f5f8fc", // 섹션 번갈아 깔리는 연한 배경
  white: "#ffffff",
};

const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif";

export const introStyles: Record<string, React.CSSProperties> = {
  // ── 섹션 공통 ──
  section: {
    width: "100%",
    padding: "96px 24px",
    boxSizing: "border-box",
    fontFamily: font,
  },
  sectionAlt: {
    backgroundColor: introColors.sectionBg,
  },
  inner: {
    maxWidth: "1120px",
    margin: "0 auto",
  },
  sectionHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "14px",
    marginBottom: "56px",
  },
  eyebrow: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    color: introColors.primary,
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 800,
    color: introColors.text,
    letterSpacing: "-0.5px",
  },
  sectionDesc: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.7,
    color: introColors.muted,
    maxWidth: "640px",
  },

  // ── 버튼 공통 ──
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    height: "48px",
    padding: "0 24px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: introColors.primaryDark,
    color: introColors.white,
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
  },
  outlineButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    height: "48px",
    padding: "0 24px",
    border: `1px solid ${introColors.primaryDark}`,
    borderRadius: "6px",
    backgroundColor: introColors.white,
    color: introColors.primaryDark,
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
  },

  // ── 핵심 기능 카드 ──
  cardGrid: {
    display: "grid",
    // 화면 폭에 따라 3열 → 2열 → 1열로 자동 조정
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "28px",
    backgroundColor: introColors.white,
    // hover 때 borderColor만 바꾸므로 border 축약형 대신 개별 속성으로 지정
    // (축약형 + borderColor를 섞으면 마우스를 뗄 때 테두리 색이 지워짐)
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: introColors.border,
    borderRadius: "8px",
    boxShadow: "none",
    transform: "none",
    transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
  },
  cardHover: {
    borderColor: "rgba(31, 78, 140, 0.35)",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
    transform: "translateY(-2px)",
  },
  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    backgroundColor: introColors.primarySoft,
    color: introColors.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: introColors.text,
  },
  cardDesc: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: introColors.muted,
  },

  // ── 이용 절차 ──
  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "20px",
  },
  step: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "28px 24px",
    backgroundColor: introColors.white,
    // card와 같은 이유로 테두리를 개별 속성으로 지정 (위쪽만 3px 파란 선)
    borderStyle: "solid",
    borderWidth: "3px 1px 1px",
    borderColor: `${introColors.primary} ${introColors.border} ${introColors.border}`,
    borderRadius: "8px",
    boxShadow: "none",
    transform: "none",
    transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
  },
  stepHover: {
    borderColor: `${introColors.primary} rgba(31, 78, 140, 0.35) rgba(31, 78, 140, 0.35)`,
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
    transform: "translateY(-4px)",
  },
  stepNumber: {
    fontSize: "32px",
    fontWeight: 800,
    color: introColors.primary,
    opacity: 0.25,
    lineHeight: 1,
    transition: "opacity 0.2s",
  },
  stepNumberHover: {
    opacity: 1,
  },
  stepTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 700,
    color: introColors.text,
  },
  stepDesc: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: introColors.muted,
  },

  // ── FAQ ──
  faqList: {
    maxWidth: "800px",
    margin: "0 auto",
    borderTop: `1px solid ${introColors.border}`,
  },
  faqItem: {
    borderBottom: `1px solid ${introColors.border}`,
  },
  faqQuestion: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "22px 4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "16px",
    fontWeight: 600,
    color: introColors.text,
    fontFamily: font,
  },
  faqAnswer: {
    margin: 0,
    padding: "0 4px 22px",
    fontSize: "15px",
    lineHeight: 1.8,
    color: introColors.muted,
  },
};
