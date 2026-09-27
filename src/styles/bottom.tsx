import type { CSSProperties } from "react";

const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', Arial, sans-serif";

export const bottomStyles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    padding: "48px 24px 32px",
    boxSizing: "border-box",
    backgroundColor: "#173357", // 버튼과 같은 어두운 파란색
    fontFamily: font,
  },
  inner: {
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "32px",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxWidth: "440px",
  },
  logo: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#ffffff",
  },
  brandDesc: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: "rgba(255, 255, 255, 0.7)",
  },
  linkGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  linkTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#ffffff",
  },
  link: {
    padding: 0,
    background: "none",
    border: "none",
    textAlign: "left",
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    cursor: "pointer",
    fontFamily: font,
  },
  copyright: {
    maxWidth: "1120px",
    margin: "32px auto 0",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.5)",
  },
};
